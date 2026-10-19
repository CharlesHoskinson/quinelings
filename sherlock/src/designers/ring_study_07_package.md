# Ring Study 07: Brushed Silver-Platinum & Alabaster Ceramic Chip Package

## 1. Material & Surface Grain Transformation (`designer1_package.js`)

To address the request to **"improve the lighting, change the color and texture of the chip"**, the monolithic package carrier has been re-materialised from a dark charcoal slab into a tactile, high-contrast **Warm Alabaster Porcelain Ceramic + Brushed Silver-Platinum Anodized Titanium + Champagne-Gold** precision instrument:

| Architectural Layer | Spatial Envelope | Material & Color | Physical Surface Grain / Texture |
| :--- | :--- | :--- | :--- |
| **Warm Alabaster Porcelain Ceramic Substrate** | `x, z ∈ [-2.15, 2.15]`, `y ∈ [-0.22, 0.08]`, open bore `[-1.08, 1.08]` | `0xebe5da` (`roughness: 0.42`, `metalness: 0.08`) | Cached 512×512 micro-pebbled sintered porcelain `map` (`SRGBColorSpace`) + matching `bumpMap` (`NoColorSpace`, `bumpScale: 0.004`) |
| **Champagne-Gold Interposer Seam & Inner Well Collar** | Horizontal seam at `y = -0.06`; vertical well collar framing `[-1.08, 1.08]` | `0xd4af37` (`roughness: 0.20`, `metalness: 0.88`) | High-specular machined gold relief bisecting the alabaster ceramic flank and lining the central well bore |
| **32 Gold-Over-Nickel Edge Contact Pads** | 8 pads per cardinal edge (`1 THREE.InstancedMesh`) | Base `0xd4af37` pulsing with `0xfbbf24` (Luminous Gold) & `0x2dd4bf` (Cyan-Teal) | Single-draw-call `THREE.InstancedMesh` updated via pre-allocated scratch `THREE.Color` instances |
| **Top Unibody Bezel Deck** | `x, z ∈ [-2.15, 2.15]`, `y ∈ [0.08, 0.105]`, open bore `[-1.08, 1.08]` | **Brushed Silver-Platinum Anodized Titanium** `0xd8dde6` (`roughness: 0.24`, `metalness: 0.78`) | `createBrushedMetalTexture` (`512×512`, `#d8dde6`) paired with a cached anisotropic horizontal-striation `roughnessMap` & `bumpMap` (`bumpScale: 0.0015`) |
| **Polished Chrome-Gold Inner Aperture Bezel** | `x, z ∈ [-1.124, 1.124]`, `y ∈ [0.082, 0.106]`, open bore `[-1.08, 1.08]` | `0xe5c86b` (`roughness: 0.16`, `metalness: 0.90`) | Diamond-cut specular collar framing the central recursion well |
| **Laser-Etched Rim Nomenclature** | North (`z = -1.56`) & South (`z = +1.58`) at `y = 0.1058` | Crisp **Dark Sapphire-Slate** (`#18202c`) with subtle specular bevel | North rim: `SHERLOCK · K-A/1`; South rim: live entry expression (`FACT(4)`, `SUM(LIST)`, `SUM(TREE)`, etc.) |

---

## 2. Recessed Sapphire-Slate Photolithography Flank Channels (`designer5_circuit.js`)

On the left (`x = -1.62`) and right (`x = +1.62`) flanks of the brushed silver-platinum lid (`y = 0.106`), the two 16-element `THREE.InstancedMesh` micro-LED arrays now sit inside clean recessed **Dark Sapphire-Slate (`0x18202c`)** photolithography channels (`y = 0.1054`), providing high-contrast optical framing against the bright `0xd8dde6` silver deck:

1. **Left Flank AST Expression Array (`1 THREE.InstancedMesh`)**:
   - Active `ProgramImage` AST expression row glows with crisp **Cyan-Teal (`0x2dd4bf`)**.
   - Neighboring populated AST rows glow in graduated teal (`0x1a9e8f` / `0x185a56`), while inactive slots rest in deep sapphire-slate (`0x243042`).
2. **Right Flank 16-Byte `UInt128` Limb Array (`1 THREE.InstancedMesh`)**:
   - Active 16-byte little-endian `UInt128` arithmetic limbs glow with **Amber-Gold (`0xfbbf24`)** (and `PALETTE.heatBright` on carry/borrow overflow).

---

## 3. Flush Rear Execution Progress Track (`designer6_loom.js`)

Inset into the rear brushed silver-platinum deck at `y = 0.106, z = -1.92`:
- A recessed **Dark Sapphire-Slate (`0x18202c`)** track (`y = 0.1054`) frames the 32-segment `THREE.InstancedMesh` progress bar.
- Completed execution steps (`i < stepIndex`) illuminate in **Cyan-Teal (`0x2dd4bf`)**.
- The active execution step (`i === stepIndex`) illuminates in **Luminous Gold (`0xfbbf24`)** (or `PALETTE.errorRed` on `ERROR`).
- Pending steps (`i > stepIndex`) rest quietly in dark sapphire-slate (`0x243042`).

---

## 4. WebGPU (`three/webgpu`) & Zero-Allocation Verification

- All three modules import `* as THREE from 'three/webgpu'` and use standard PBR/unlit node-compatible materials (`MeshStandardMaterial`, `MeshBasicMaterial`).
- All per-frame `.update(stepState)` paths operate with **zero heap allocations**, reusing module-scope `_tmpColor`, `_tmpMatrix`, `_tmpPos`, `_tmpQuat`, and `_tmpScale` instances.
