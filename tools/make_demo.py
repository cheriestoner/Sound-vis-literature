"""Render the same recordings in several displays for the demo section.

Usage (from the sound-vis-review folder):
    python3 tools/make_demo.py

Needs: numpy, scipy, matplotlib, soundfile.
Edit SAMPLES below to change or add recordings. Source files are read from
`demo/source/` (copy them there first); outputs go to `demo/img/` and
`demo/audio/`, and a manifest is written to `demo/demo.js`.

All time-based images are drawn edge to edge (no axes) so the page can place
its own axis labels and a moving playhead on them.
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import soundfile as sf
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "demo", "source")
IMG = os.path.join(ROOT, "demo", "img")
AUD = os.path.join(ROOT, "demo", "audio")

# id, file, label, start (s), duration (s), max frequency shown (Hz), F0 search range (Hz), LPC frame time (s)
SAMPLES = [
    dict(id="speech", file="speech_neu_F_English_00002_s6_l_lgit8n-F.wav",
         label="Speech (English, female)", start=0.0, dur=None, fmax=5000, f0=(120, 400), lpc_t=0.62),
    dict(id="cry_sub", file="Sb_AMJ_B14.wav",
         label="Infant cry with subharmonics", start=0.0, dur=None, fmax=8000, f0=(250, 900), lpc_t=1.2),
    dict(id="cry_chaos", file="Chaos_FAC_D1.wav",
         label="Infant cry with chaos", start=0.0, dur=None, fmax=8000, f0=(250, 900), lpc_t=1.2),
    dict(id="singing", file="singing_chants_F_Buddhist-Tayata_Muni_Muni-J0450.wav",
         label="Singing (chant, female)", start=0.0, dur=4.0, fmax=5000, f0=(150, 600), lpc_t=1.5),
]

W, H = 9.0, 2.6     # inches for time-based images (900 x 260 px at dpi 100)
DPI = 100
LINE = "#4A7BD0"    # mid-tone blue, readable on light and dark page backgrounds
LINE2 = "#D9822B"


def load(s):
    x, sr = sf.read(os.path.join(SRC, s["file"]), always_2d=True)
    x = x.mean(axis=1)
    a = int(s["start"] * sr)
    b = len(x) if s["dur"] is None else a + int(s["dur"] * sr)
    x = x[a:b]
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.95
    return x, sr


def bare_axes(w=W, h=H):
    fig = plt.figure(figsize=(w, h), dpi=DPI)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_axis_off()
    return fig, ax


def save(fig, name, transparent=False):
    path = os.path.join(IMG, name)
    fig.savefig(path, dpi=DPI, transparent=transparent)
    plt.close(fig)
    return "demo/img/" + name


def stft_db(x, sr, win_ms, fmax):
    n = int(sr * win_ms / 1000)
    n = max(n, 32)
    hop = max(1, int(sr * 0.002))
    nfft = int(2 ** np.ceil(np.log2(max(n, 512))))
    f, t, Z = signal.stft(x, sr, window="hann", nperseg=n, noverlap=n - hop, nfft=nfft, boundary=None, padded=False)
    S = 20 * np.log10(np.abs(Z) + 1e-10)
    keep = f <= fmax
    return f[keep], t, S[keep]


def spectro(x, sr, s, win_ms, name, dr=70, cmap="magma", logf=False):
    f, t, S = stft_db(x, sr, win_ms, s["fmax"])
    S = S - S.max()
    fig, ax = bare_axes()
    if logf:
        fl = np.geomspace(50, s["fmax"], 256)
        Si = np.array([np.interp(fl, f, S[:, j]) for j in range(S.shape[1])]).T
        ax.imshow(Si, origin="lower", aspect="auto", cmap=cmap, vmin=-dr, vmax=0, interpolation="bilinear",
                  extent=[0, len(x) / sr, 0, 1])
    else:
        ax.imshow(S, origin="lower", aspect="auto", cmap=cmap, vmin=-dr, vmax=0, interpolation="bilinear",
                  extent=[0, len(x) / sr, 0, s["fmax"]])
    return save(fig, name)


def mel_spectro(x, sr, s, name, n_mels=96):
    f, t, S = stft_db(x, sr, 25, s["fmax"])
    P = 10 ** (S / 10)
    mel = lambda hz: 2595 * np.log10(1 + hz / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(0), mel(s["fmax"]), n_mels + 2))
    fb = np.zeros((n_mels, len(f)))
    for i in range(n_mels):
        lo, c, hi = pts[i], pts[i + 1], pts[i + 2]
        fb[i] = np.clip(np.minimum((f - lo) / (c - lo + 1e-9), (hi - f) / (hi - c + 1e-9)), 0, None)
    M = 10 * np.log10(fb @ P + 1e-12)
    M = M - M.max()
    fig, ax = bare_axes()
    ax.imshow(M, origin="lower", aspect="auto", cmap="viridis", vmin=-70, vmax=0, interpolation="nearest",
              extent=[0, len(x) / sr, 0, n_mels])
    return save(fig, name)


def waveform(x, sr, name):
    t = np.arange(len(x)) / sr
    hop = max(1, int(sr * 0.01))
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (hop, hop)), 2 * hop)[::hop]
    rms = np.sqrt((frames ** 2).mean(axis=1))
    te = np.arange(len(rms)) * hop / sr
    fig, ax = bare_axes()
    ax.plot(t, x, color=LINE, lw=0.4, alpha=0.75)
    ax.plot(te, rms * 2.2, color=LINE2, lw=1.6)
    ax.set_xlim(0, t[-1]); ax.set_ylim(-1, 1)
    return save(fig, name, transparent=True)


def pitch_track(x, sr, fmin, fmax):
    n = int(sr * 0.04); hop = int(sr * 0.01)
    f0s, ts = [], []
    energy_thr = 0.02 * np.max(np.abs(x))
    for i in range(0, len(x) - n, hop):
        fr = x[i:i + n] * np.hanning(n)
        ts.append((i + n / 2) / sr)
        if np.sqrt(np.mean(fr ** 2)) < energy_thr * 0.3:
            f0s.append(np.nan); continue
        ac = np.correlate(fr, fr, "full")[n - 1:]
        ac /= ac[0] + 1e-12
        lo, hi = int(sr / fmax), min(int(sr / fmin), n - 2)
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] < 0.45:
            f0s.append(np.nan); continue
        a, b, c = ac[k - 1], ac[k], ac[k + 1]
        shift = 0.5 * (a - c) / (a - 2 * b + c + 1e-12)
        f0s.append(sr / (k + shift))
    ts, f0s = np.array(ts), np.array(f0s)
    return ts, clean_f0(f0s)


def clean_f0(f0, k=7, tol=0.18, min_len=6):
    """Remove octave jumps and isolated fragments: keep frames within `tol` of a
    running median of voiced frames, then drop voiced runs shorter than `min_len`."""
    out = f0.copy()
    for i in range(len(f0)):
        if np.isnan(f0[i]):
            continue
        win = f0[max(0, i - k):i + k + 1]
        win = win[~np.isnan(win)]
        if len(win) >= 3 and abs(f0[i] - np.median(win)) > tol * np.median(win):
            out[i] = np.nan
    run = 0
    for i in range(len(out) + 1):
        if i < len(out) and not np.isnan(out[i]):
            run += 1
        else:
            if 0 < run < min_len:
                out[i - run:i] = np.nan
            run = 0
    return out


def pitch(x, sr, s, name):
    t, f0 = pitch_track(x, sr, *s["f0"])
    fig, ax = bare_axes()
    ax.plot(t, f0, color=LINE, lw=2.2, solid_capstyle="round")
    ax.set_xlim(0, len(x) / sr); ax.set_ylim(*s["f0"])
    return save(fig, name, transparent=True), [float(np.nanmin(f0)), float(np.nanmax(f0))] if np.any(~np.isnan(f0)) else None


def lpc_coeffs(fr, order):
    r = np.correlate(fr, fr, "full")[len(fr) - 1:len(fr) + order]
    a = np.zeros(order + 1); a[0] = 1.0; e = r[0]
    for i in range(1, order + 1):
        k = -(r[i] + np.dot(a[1:i], r[i - 1:0:-1])) / e
        a[1:i + 1] = a[1:i + 1] + k * np.concatenate([a[i - 1:0:-1], [1.0]])
        e *= (1 - k * k)
    return a, e


def lpc_slice(x, sr, s, name):
    n = int(sr * 0.03); c = int(s["lpc_t"] * sr); fr = x[max(0, c - n // 2):c + n // 2]
    fr = signal.lfilter([1, -0.97], 1, fr) * np.hamming(len(fr))
    order = int(2 + sr / 1000)
    a, e = lpc_coeffs(fr, order)
    w, h = signal.freqz([np.sqrt(abs(e))], a, worN=1024, fs=sr)
    F = np.fft.rfft(fr, 2048); fF = np.fft.rfftfreq(2048, 1 / sr)
    keep, keepF = w <= s["fmax"], fF <= s["fmax"]
    env = 20 * np.log10(np.abs(h[keep]) + 1e-12); spec = 20 * np.log10(np.abs(F[keepF]) + 1e-12)
    top = max(env.max(), spec.max())
    peaks, _ = signal.find_peaks(env, prominence=3)
    fig = plt.figure(figsize=(4.5, H), dpi=DPI); ax = fig.add_axes([0, 0, 1, 1]); ax.set_axis_off()
    ax.plot(fF[keepF], spec - top, color=LINE, lw=0.6, alpha=0.45)
    ax.plot(w[keep], env - top, color=LINE2, lw=2.4)
    for p in peaks[:3]:
        ax.plot([w[keep][p]], [env[p] - top], "o", color=LINE2, ms=5)
    ax.set_xlim(0, s["fmax"]); ax.set_ylim(-80, 5)
    formants = [float(w[keep][p]) for p in peaks[:3]]
    return save(fig, name, transparent=True), formants


def main():
    os.makedirs(IMG, exist_ok=True); os.makedirs(AUD, exist_ok=True)
    manifest = []
    for s in SAMPLES:
        x, sr = load(s)
        sid = s["id"]
        sf.write(os.path.join(AUD, sid + ".wav"), x, sr, subtype="PCM_16")
        entry = dict(id=sid, label=s["label"], source=s["file"], audio=f"demo/audio/{sid}.wav",
                     duration=round(len(x) / sr, 3), fmax=s["fmax"], f0range=list(s["f0"]), lpc_t=s["lpc_t"], img={})
        entry["img"]["wave"] = waveform(x, sr, f"{sid}_wave.png")
        p, rng = pitch(x, sr, s, f"{sid}_pitch.png"); entry["img"]["pitch"] = p
        entry["img"]["spec_wide"] = spectro(x, sr, s, 5, f"{sid}_spec_wide.png")
        entry["img"]["spec_narrow"] = spectro(x, sr, s, 40, f"{sid}_spec_narrow.png")
        entry["img"]["mel"] = mel_spectro(x, sr, s, f"{sid}_mel.png")
        lp, formants = lpc_slice(x, sr, s, f"{sid}_lpc.png"); entry["img"]["lpc"] = lp; entry["formants"] = formants
        # rendering variants of the same narrowband spectrogram
        entry["img"]["r_gray70"] = spectro(x, sr, s, 25, f"{sid}_r_gray70.png", dr=70, cmap="gray_r")
        entry["img"]["r_dr40"] = spectro(x, sr, s, 25, f"{sid}_r_dr40.png", dr=40)
        entry["img"]["r_dr90"] = spectro(x, sr, s, 25, f"{sid}_r_dr90.png", dr=90)
        entry["img"]["r_logf"] = spectro(x, sr, s, 25, f"{sid}_r_logf.png", dr=70, logf=True)
        manifest.append(entry)
        print("rendered", sid)
    with open(os.path.join(ROOT, "demo", "demo.js"), "w") as fh:
        fh.write("// Generated by tools/make_demo.py. Do not edit by hand.\n")
        fh.write("window.DEMO = " + json.dumps(manifest, indent=1) + ";\n")


if __name__ == "__main__":
    main()
