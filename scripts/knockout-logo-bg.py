"""
Knock out the light backdrop from the VRentNow logo (white-car variant).

1. Treat near-white as candidate background.
2. Close ink gaps so the car body is enclosed, then flood-fill exterior white.
3. Keep smaller enclosed white fills (car, road dashes); drop the large disc
   inside the yellow arc.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(
    r"C:\Users\Dragon-Lord\.cursor\projects\c-Users-Dragon-Lord-Documents-GitHub-vrentnow"
    r"\assets\c__Users_Dragon-Lord_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"7de1a2e53ba8e6057c789297c4c54ad5_images_newlogo-8114e0f2-0b3a-43d0-9d63-ee67f88ffece.png"
)

OUTS = [
    Path(r"c:\Users\Dragon-Lord\Documents\GitHub\vrentnow\apps\web\public\images\logo.png"),
    Path(r"c:\Users\Dragon-Lord\Documents\GitHub\vrentnow\apps\admin\public\images\logo.png"),
    Path(r"c:\Users\Dragon-Lord\Documents\GitHub\vrentnow\apps\web\app\icon.png"),
    Path(r"c:\Users\Dragon-Lord\Documents\GitHub\vrentnow\apps\admin\app\icon.png"),
]

WHITE_MIN = 250
MAX_ENCLOSED_WHITE = 8000


def main() -> None:
    rgb = np.asarray(Image.open(SRC).convert("RGB"), dtype=np.uint8)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    near_white = (rgb >= WHITE_MIN).all(axis=2)
    ink = ~near_white

    walls = ndimage.binary_closing(ink, structure=np.ones((9, 9)))
    walls = ndimage.binary_dilation(walls, structure=np.ones((2, 2)))

    travel = near_white & ~walls
    labeled, _ = ndimage.label(travel)
    border = np.zeros_like(travel, dtype=bool)
    border[0, :] = True
    border[-1, :] = True
    border[:, 0] = True
    border[:, -1] = True
    edge_labels = np.unique(labeled[border & travel])
    edge_labels = edge_labels[edge_labels > 0]
    edge_bg = np.isin(labeled, edge_labels)

    enclosed = near_white & ~edge_bg & ~walls
    labeled_e, n = ndimage.label(enclosed)
    keep_enclosed = np.zeros_like(enclosed)
    for i in range(1, n + 1):
        if int((labeled_e == i).sum()) <= MAX_ENCLOSED_WHITE:
            keep_enclosed |= labeled_e == i

    dist = ndimage.distance_transform_edt(~ink)
    keep = ink | keep_enclosed | (near_white & (dist <= 2) & ~edge_bg)

    fringe = keep & near_white & ndimage.binary_dilation(~keep, structure=np.ones((3, 3)))
    keep = (keep & ~fringe) | ink

    alpha = np.where(keep, 255, 0).astype(np.uint8)
    im = Image.fromarray(np.dstack([r, g, b, alpha]), "RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    for out in OUTS:
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, format="PNG")
        print(f"wrote {out} {im.size}")


if __name__ == "__main__":
    main()
