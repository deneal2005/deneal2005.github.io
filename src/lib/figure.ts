/**
 * The swordsman, drawn by hand as a silhouette in a 360 × 400 box with the
 * ground at y = 400. Seen three-quarters from behind, facing right, a moment
 * after the cut: blade low and forward, kasa tilted, hakama caught by the wind.
 */
export const FIGURE = {
  width: 360,
  height: 400,
  /** Kasa, torso, sleeves and hakama as one silhouette. */
  body: [
    // kasa: a wide, shallow cone tipped toward the blade
    'M44 93 C72 76 103 60 128 49 C153 57 187 71 218 86 C212 92 197 95 182 96 L94 99 C71 99 53 97 44 93 Z',
    // neck, then the line of the shoulders into the sword arm
    'M113 97 L147 96 L149 108 C156 111 163 115 168 120',
    // top of the sleeve, elbow, forearm to the fist
    'C178 132 188 146 198 160 C208 174 218 188 226 199',
    'C232 202 237 207 238 213 C236 219 230 222 224 221',
    // sleeve hem hanging under the forearm, then up its inner edge
    'C220 222 214 223 208 224 L186 226 C182 214 178 196 174 178 C172 166 170 156 168 150',
    // front of the torso down to the obi
    'C168 164 168 178 169 192',
    // hakama, front leg, wide stance
    'C180 236 196 290 214 338 C222 362 230 384 242 400',
    'L182 400 C178 382 170 364 160 346 C156 338 154 330 152 322',
    // the split between the legs, rear leg
    'C142 344 132 370 122 400',
    'L48 400 C52 388 56 376 60 364',
    // rear hem flaring back in the wind
    'C66 336 76 300 88 262 C94 238 100 214 104 196',
    // rear sleeve
    'L98 205 C88 206 78 204 70 200 C70 180 72 158 80 140 C84 132 90 126 96 122',
    'C102 116 108 112 113 110 Z',
  ].join(' '),
  /** Tails of the headband, streaming behind. */
  ribbon:
    'M114 103 C98 106 80 110 56 117 C74 117 92 114 114 109 Z M113 108 C99 114 84 121 63 130 C80 127 97 121 114 113 Z',
  /** Scabbard at the left hip, pointing back and down. */
  saya: 'M116 191 L27 234 L30 240 L118 198 Z',
  /** Hilt from the fist toward the blade. */
  tsuka: 'M224.4 200.5 L247.4 222.5 L242.6 227.5 L219.6 205.5 Z',
  tsuba: 'M243.8 223.9 a3 9 43.5 1 0 4.35 4.13 a3 9 43.5 1 0 -4.35 -4.13 Z',
  /** Blade: slight curvature (sori), tapering to the point. */
  blade: 'M249.7 226.2 C285 257 318 290 351 326 C312 299 279 268 246.3 229.8 Z',
  /** Where the blade's point sits, for aligning the cut. */
  tip: [351, 326] as const,
  /** Angle of the blade in degrees; the cut through the sun continues along it. */
  angle: 43.5,
};
