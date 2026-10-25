export const AQUADROP_MASCOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" class="mascot-svg" role="img" aria-label="AquaDrop Mascot">
  <defs>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#72D6FF" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#38B6FF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#38B6FF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0.2" y1="0.1" x2="0.8" y2="0.95">
      <stop offset="0%" stop-color="#80E0FF"/>
      <stop offset="25%" stop-color="#46C2FF"/>
      <stop offset="65%" stop-color="#1B88F5"/>
      <stop offset="100%" stop-color="#0B63D6"/>
    </linearGradient>
    <radialGradient id="causticGlow" cx="45%" cy="75%" r="40%">
      <stop offset="0%" stop-color="#C5F3FF" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="#6BD5FF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#1B88F5" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="topReflect" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#A8ECFF" stop-opacity="0.7"/>
      <stop offset="70%" stop-color="#38B6FF" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0B63D6" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="115" r="82" fill="url(#auraGlow)"/>
  <circle cx="34" cy="62" r="14" fill="url(#bubbleGrad)"/>
  <circle cx="166" cy="74" r="11" fill="url(#bubbleGrad)"/>
  <path d="M100 24 C106 36, 126 72, 142 98 C158 124, 158 152, 140 172 C122 192, 78 192, 60 172 C42 152, 42 124, 58 98 C74 72, 94 36, 100 24 Z" fill="url(#bodyGrad)"/>
  <ellipse cx="100" cy="154" rx="42" ry="24" fill="url(#causticGlow)"/>
  <path d="M96 36 C86 52, 66 84, 60 114 C58 100, 68 68, 92 40 Z" fill="url(#topReflect)"/>
  <g>
    <ellipse cx="82" cy="124" rx="6.5" ry="9" fill="#0A2246"/>
    <circle cx="80" cy="120" r="3.2" fill="#FFFFFF"/>
    <circle cx="84.5" cy="127" r="1.5" fill="#FFFFFF"/>
  </g>
  <g>
    <ellipse cx="118" cy="124" rx="6.5" ry="9" fill="#0A2246"/>
    <circle cx="116" cy="120" r="3.2" fill="#FFFFFF"/>
    <circle cx="120.5" cy="127" r="1.5" fill="#FFFFFF"/>
  </g>
  <ellipse cx="70" cy="133" rx="7.5" ry="4" fill="#FF6B9D" opacity="0.6"/>
  <ellipse cx="130" cy="133" rx="7.5" ry="4" fill="#FF6B9D" opacity="0.6"/>
  <path d="M94 135 C96 143, 104 143, 106 135" stroke="#0A2246" stroke-width="3" stroke-linecap="round" fill="#F85C7F"/>
</svg>`

export const AQUADROP_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
  <defs>
    <linearGradient id="icongrad" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>
  <path d="M32 58c11-8 20-18 20-28A20 20 0 0032 10 20 20 0 0012 30c0 10 9 20 28z" fill="url(#icongrad)"/>
  <circle cx="25" cy="28" r="2.5" fill="#fff" opacity="0.9"/>
  <circle cx="39" cy="28" r="2.5" fill="#fff" opacity="0.9"/>
  <path d="M25 36c2.5 3 11.5 3 14 0" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9"/>
</svg>`
