'use client';

import React, { useState } from 'react';
import { AnatomicalMuscle } from '@/lib/muscleRanks';
import { MuscleTierInfo } from '@/types/workout';

interface SymmetryAnatomyModelProps {
  muscleTiers: Record<AnatomicalMuscle, MuscleTierInfo>;
  onSelectMuscle: (muscle: AnatomicalMuscle) => void;
  selectedMuscle?: AnatomicalMuscle | null;
}

export const SymmetryAnatomyModel: React.FC<SymmetryAnatomyModelProps> = ({
  muscleTiers,
  onSelectMuscle,
  selectedMuscle,
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<AnatomicalMuscle | null>(null);

  // Helper to get color for each muscle group
  const getColor = (muscle: AnatomicalMuscle) => muscleTiers[muscle]?.color || '#F43F5E';

  // Base colors mapped to Symmetry's exact scheme from Image 4
  const chestColor = getColor('pecho'); // Esmeralda
  const latsColor = getColor('espalda'); // Esmeralda
  const deltsColor = getColor('hombros'); // Rubí
  const bicepsColor = getColor('biceps'); // Rubí
  const tricepsColor = getColor('triceps'); // Diamante
  const absColor = getColor('abdomen'); // Oro
  const quadsColor = getColor('piernas'); // Rubí
  const adductorColor = muscleTiers.piernas?.level > 18 ? '#0EA5E9' : '#38BDF8'; // Diamante cyan (Image 4)
  const calvesColor = getColor('pantorrillas'); // Oro
  const trapsColor = '#FACC15'; // Oro (Image 4)
  const hamstringsColor = getColor('piernas'); // Rubí / Oro (Image 4)

  const isHighlighted = (muscle: AnatomicalMuscle) =>
    hoveredMuscle === muscle || selectedMuscle === muscle;

  const getMuscleProps = (muscle: AnatomicalMuscle) => ({
    onClick: () => onSelectMuscle(muscle),
    onMouseEnter: () => setHoveredMuscle(muscle),
    onMouseLeave: () => setHoveredMuscle(null),
    className:
      'cursor-pointer transition-all duration-200 hover:brightness-125 active:scale-[0.99] select-none',
    style: {
      filter: isHighlighted(muscle)
        ? `drop-shadow(0 0 10px ${getColor(muscle)}) brightness(1.25)`
        : 'none',
    },
  });

  return (
    <div className="w-full bg-[#000000] rounded-[30px] p-3 sm:p-5 border border-white/10 shadow-2xl relative select-none">
      {/* Visual Header Labels matching Image 4 */}
      <div className="grid grid-cols-2 text-center pb-2 border-b border-white/5">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          VISTA FRONTAL
        </span>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93]">
          VISTA POSTERIOR
        </span>
      </div>

      {/* SVG Anatomical Model Viewport */}
      <div className="w-full flex items-center justify-center py-2">
        <svg
          viewBox="0 0 540 500"
          className="w-full h-auto max-h-[480px] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          style={{ background: '#000000' }}
        >
          <defs>
            <linearGradient id="absGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={absColor} stopOpacity="1" />
              <stop offset="100%" stopColor={absColor} stopOpacity="0.85" />
            </linearGradient>
            <filter id="softGlow" x1="-20%" y1="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ========================================================================= */}
          {/* 1. FRONT VIEW (VISTA FRONTAL) - Centered at X = 145                      */}
          {/* ========================================================================= */}
          <g id="front-view">
            {/* Neutral Body Base Outlines (White stroke, Black fill) */}
            {/* Head */}
            <path
              d="M 145 22 C 134 22, 131 32, 131 42 C 131 54, 139 64, 145 68 C 151 64, 159 54, 159 42 C 159 32, 156 22, 145 22 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Neck & Clavicle Frame */}
            <path
              d="M 140 65 L 138 78 L 152 78 L 150 65 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Hands (Left & Right) */}
            {/* Left Hand */}
            <path
              d="M 57 262 C 55 266, 50 274, 46 280 C 44 283, 42 290, 44 293 C 46 296, 50 295, 52 288 L 56 278 C 58 288, 60 296, 62 297 C 64 297, 66 291, 65 284 L 67 274 C 69 280, 71 288, 73 287 C 75 286, 75 278, 73 270 L 69 258 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            {/* Right Hand */}
            <path
              d="M 233 262 C 235 266, 240 274, 244 280 C 246 283, 248 290, 246 293 C 244 296, 240 295, 238 288 L 234 278 C 232 288, 230 296, 228 297 C 226 297, 224 291, 225 284 L 223 274 C 221 280, 219 288, 217 287 C 215 286, 215 278, 217 270 L 221 258 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />

            {/* Groin / Pelvis neutral center */}
            <path
              d="M 137 252 L 145 264 L 153 252 L 148 244 L 142 244 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.8"
            />

            {/* Knees (Patella) */}
            <circle cx="120" cy="360" r="5" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="170" cy="360" r="5" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />

            {/* Feet (Left & Right) */}
            {/* Left Foot */}
            <path
              d="M 112 458 L 107 482 C 105 487, 107 492, 114 492 C 120 492, 124 485, 122 478 L 122 458 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Right Foot */}
            <path
              d="M 178 458 L 183 482 C 185 487, 183 492, 176 492 C 170 492, 166 485, 168 478 L 168 458 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* --- MUSCLE GROUPS: FRONT --- */}

            {/* Deltoids / Shoulders (Hombros - Rubí) */}
            <g id="front-shoulders" {...getMuscleProps('hombros')}>
              {/* Left Shoulder Cap */}
              <path
                d="M 132 80 C 118 80, 104 88, 97 100 C 93 108, 93 116, 96 122 C 100 126, 107 122, 109 116 C 112 108, 118 95, 127 88 Z"
                fill={deltsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Shoulder Cap */}
              <path
                d="M 158 80 C 172 80, 186 88, 193 100 C 197 108, 197 116, 194 122 C 190 126, 183 122, 181 116 C 178 108, 172 95, 163 88 Z"
                fill={deltsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Pectorals / Chest (Pecho - Esmeralda) */}
            <g id="front-chest" {...getMuscleProps('pecho')}>
              {/* Left Pectoral */}
              <path
                d="M 143 83 L 129 88 C 122 93, 116 102, 114 112 C 114 123, 123 133, 137 134 C 141 134, 143 130, 143 125 Z"
                fill={chestColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Pectoral */}
              <path
                d="M 147 83 L 161 88 C 168 93, 174 102, 176 112 C 176 123, 167 133, 153 134 C 149 134, 147 130, 147 125 Z"
                fill={chestColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Biceps (Bíceps - Rubí) */}
            <g id="front-biceps" {...getMuscleProps('biceps')}>
              {/* Left Bicep */}
              <path
                d="M 97 125 C 93 132, 91 144, 93 154 C 95 162, 101 166, 105 163 C 108 156, 108 142, 107 132 C 106 127, 101 123, 97 125 Z"
                fill={bicepsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Right Bicep */}
              <path
                d="M 193 125 C 197 132, 199 144, 197 154 C 195 162, 189 166, 185 163 C 182 156, 182 142, 183 132 C 184 127, 189 123, 193 125 Z"
                fill={bicepsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </g>

            {/* Forearms (Antebrazos - Esmeralda) */}
            <g id="front-forearms" {...getMuscleProps('biceps')}>
              {/* Left Forearm */}
              <path
                d="M 92 165 C 86 178, 77 202, 70 225 C 67 236, 68 248, 68 256 L 75 255 C 79 246, 85 225, 93 200 C 97 188, 98 175, 96 166 Z"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Right Forearm */}
              <path
                d="M 198 165 C 204 178, 213 202, 220 225 C 223 236, 222 248, 222 256 L 215 255 C 211 246, 205 225, 197 200 C 193 188, 192 175, 194 166 Z"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </g>

            {/* Abdominals & Core (Abdomen - Oro) */}
            <g id="front-abs" {...getMuscleProps('abdomen')}>
              {/* Top pack left */}
              <path
                d="M 137 139 L 143 138 L 143 154 L 135 154 C 133 148, 134 142, 137 139 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Top pack right */}
              <path
                d="M 153 139 L 147 138 L 147 154 L 155 154 C 157 148, 156 142, 153 139 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Mid pack left */}
              <path
                d="M 134 158 L 143 158 L 143 174 L 133 174 C 132 168, 132 163, 134 158 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Mid pack right */}
              <path
                d="M 156 158 L 147 158 L 147 174 L 157 174 C 158 168, 158 163, 156 158 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Lower abs left */}
              <path
                d="M 133 178 L 143 178 L 143 196 L 131 195 C 130 188, 131 182, 133 178 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Lower abs right */}
              <path
                d="M 157 178 L 147 178 L 147 196 L 159 195 C 160 188, 159 182, 157 178 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              {/* Lower V-taper pelvic obliques */}
              <path
                d="M 131 200 L 143 200 L 144 238 L 135 248 C 129 236, 128 218, 131 200 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <path
                d="M 159 200 L 147 200 L 146 238 L 155 248 C 161 236, 162 218, 159 200 Z"
                fill={absColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
            </g>

            {/* Quads (Piernas - Rubí) */}
            <g id="front-quads" {...getMuscleProps('piernas')}>
              {/* Left Outer Quad */}
              <path
                d="M 132 250 C 122 258, 110 274, 107 296 C 104 316, 107 338, 114 354 L 119 352 C 120 338, 122 316, 124 295 C 125 278, 129 262, 132 250 Z"
                fill={quadsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Left Rectus Femoris (Quad center) */}
              <path
                d="M 132 256 C 131 275, 128 305, 126 332 C 125 344, 124 352, 120 356 C 123 358, 128 358, 131 352 C 136 338, 139 308, 138 274 Z"
                fill={quadsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              {/* Right Outer Quad */}
              <path
                d="M 158 250 C 168 258, 180 274, 183 296 C 186 316, 183 338, 176 354 L 171 352 C 170 338, 168 316, 166 295 C 165 278, 161 262, 158 250 Z"
                fill={quadsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Rectus Femoris */}
              <path
                d="M 158 256 C 159 275, 162 305, 164 332 C 165 344, 166 352, 170 356 C 167 358, 162 358, 159 352 C 154 338, 151 308, 152 274 Z"
                fill={quadsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </g>

            {/* Adductors (Inner Thighs - Diamante Cyan matching Image 4) */}
            <g id="front-adductors" {...getMuscleProps('piernas')}>
              {/* Left Adductor */}
              <path
                d="M 140 262 C 141 282, 140 305, 137 325 C 135 336, 132 346, 129 352 C 127 348, 128 335, 131 315 C 134 295, 136 276, 137 262 Z"
                fill={adductorColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Right Adductor */}
              <path
                d="M 150 262 C 149 282, 150 305, 153 325 C 155 336, 158 346, 161 352 C 163 348, 162 335, 159 315 C 156 295, 154 276, 153 262 Z"
                fill={adductorColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </g>

            {/* Calves & Shins (Pantorrillas - Oro) */}
            <g id="front-calves" {...getMuscleProps('pantorrillas')}>
              {/* Left Calf / Tibialis */}
              <path
                d="M 112 370 C 106 385, 105 408, 108 430 C 110 445, 114 456, 114 456 L 118 456 C 117 442, 116 425, 118 402 C 119 388, 122 376, 122 370 Z"
                fill={calvesColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Calf / Tibialis */}
              <path
                d="M 178 370 C 184 385, 185 408, 182 430 C 180 445, 176 456, 176 456 L 172 456 C 173 442, 174 425, 172 402 C 171 388, 168 376, 168 370 Z"
                fill={calvesColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 2. BACK VIEW (VISTA POSTERIOR) - Centered at X = 395                     */}
          {/* ========================================================================= */}
          <g id="back-view">
            {/* Neutral Body Base Outlines */}
            {/* Head (Posterior with haircut contour) */}
            <path
              d="M 395 22 C 384 22, 381 32, 381 42 C 381 54, 389 64, 395 68 C 401 64, 409 54, 409 42 C 409 32, 406 22, 395 22 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Neck cutout line */}
            <path d="M 391 60 L 395 66 L 399 60" fill="none" stroke="#FFFFFF" strokeWidth="2" />

            {/* Hands (Left & Right posterior) */}
            <path
              d="M 307 262 C 305 266, 300 274, 296 280 C 294 283, 292 290, 294 293 C 296 296, 300 295, 302 288 L 306 278 C 308 288, 310 296, 312 297 C 314 297, 316 291, 315 284 L 317 274 C 319 280, 321 288, 323 287 C 325 286, 325 278, 323 270 L 319 258 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M 483 262 C 485 266, 490 274, 494 280 C 496 283, 498 290, 496 293 C 494 296, 490 295, 488 288 L 484 278 C 482 288, 480 296, 478 297 C 476 297, 474 291, 475 284 L 473 274 C 471 280, 469 288, 467 287 C 465 286, 465 278, 467 270 L 471 258 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />

            {/* Glutes & Lower Back (Symmetry Image 4: pure black with white muscular contour arches) */}
            <g id="back-glutes" {...getMuscleProps('gluteos')}>
              {/* Left Glute */}
              <path
                d="M 394 228 C 382 232, 368 245, 368 266 C 368 286, 380 300, 394 296 C 395 276, 395 248, 394 228 Z"
                fill="#000000"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Right Glute */}
              <path
                d="M 396 228 C 408 232, 422 245, 422 266 C 422 286, 410 300, 396 296 C 395 276, 395 248, 396 228 Z"
                fill="#000000"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Glute divider crease */}
              <path d="M 395 230 L 395 292" stroke="#FFFFFF" strokeWidth="2" />
            </g>

            {/* Feet Posterior */}
            <path
              d="M 362 458 L 357 482 C 355 487, 357 492, 364 492 C 370 492, 374 485, 372 478 L 372 458 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M 428 458 L 433 482 C 435 487, 433 492, 426 492 C 420 492, 416 485, 418 478 L 418 458 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* --- MUSCLE GROUPS: BACK --- */}

            {/* Trapezius (Trapecios - Oro/Yellow matching Image 4) */}
            <g id="back-traps" {...getMuscleProps('espalda')}>
              {/* Diamond Kite shape */}
              <path
                d="M 395 68 L 388 78 L 368 98 C 375 106, 385 116, 395 130 C 405 116, 415 106, 422 98 L 402 78 Z"
                fill={trapsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Rear Deltoids (Hombros posteriores - Rubí) */}
            <g id="back-delts" {...getMuscleProps('hombros')}>
              {/* Left Rear Delt */}
              <path
                d="M 366 96 C 352 98, 344 108, 342 118 C 342 125, 348 128, 356 124 C 362 120, 368 112, 370 102 Z"
                fill={deltsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Rear Delt */}
              <path
                d="M 424 96 C 438 98, 446 108, 448 118 C 448 125, 442 128, 434 124 C 428 120, 422 112, 420 102 Z"
                fill={deltsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Triceps (Tríceps - Diamante Light Blue matching Image 4) */}
            <g id="back-triceps" {...getMuscleProps('triceps')}>
              {/* Left Tricep */}
              <path
                d="M 345 125 C 342 135, 338 152, 344 164 C 348 170, 356 166, 358 156 C 360 144, 358 132, 352 125 Z"
                fill={tricepsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Tricep */}
              <path
                d="M 445 125 C 448 135, 452 152, 446 164 C 442 170, 434 166, 432 156 C 430 144, 432 132, 438 125 Z"
                fill={tricepsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Lats (Dorsales / Espalda - Esmeralda Green matching Image 4) */}
            <g id="back-lats" {...getMuscleProps('espalda')}>
              {/* Left Lat Wing */}
              <path
                d="M 393 135 C 382 142, 362 148, 352 165 C 346 178, 344 195, 348 214 L 358 208 C 366 195, 376 182, 393 174 Z"
                fill={latsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Lat Wing */}
              <path
                d="M 397 135 C 408 142, 428 148, 438 165 C 444 178, 446 195, 442 214 L 432 208 C 424 195, 414 182, 397 174 Z"
                fill={latsColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Central V-Taper spine bridge */}
              <path
                d="M 393 176 L 393 216 L 397 216 L 397 176 Z"
                fill={latsColor}
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
            </g>

            {/* Posterior Forearms (Antebrazos - Esmeralda) */}
            <g id="back-forearms" {...getMuscleProps('biceps')}>
              <path
                d="M 342 165 C 336 178, 327 202, 320 225 C 317 236, 318 248, 318 256 L 325 255 C 329 246, 335 225, 343 200 C 347 188, 348 175, 346 166 Z"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M 448 165 C 454 178, 463 202, 470 225 C 473 236, 472 248, 472 256 L 465 255 C 461 246, 455 225, 447 200 C 443 188, 442 175, 444 166 Z"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </g>

            {/* Hamstrings (Isquiotibiales - Oro inner & Rubí outer matching Image 4) */}
            <g id="back-hamstrings" {...getMuscleProps('piernas')}>
              {/* Left Hamstring Inner (Oro) */}
              <path
                d="M 393 300 C 392 316, 388 338, 384 358 C 381 370, 376 376, 372 376 C 374 366, 376 348, 380 326 C 383 310, 387 300, 393 300 Z"
                fill="#FACC15"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Left Hamstring Outer (Rubí) */}
              <path
                d="M 380 298 C 368 306, 360 322, 356 340 C 354 352, 355 362, 358 370 L 366 366 C 368 350, 371 332, 376 312 Z"
                fill={hamstringsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              {/* Right Hamstring Inner (Oro) */}
              <path
                d="M 397 300 C 398 316, 402 338, 406 358 C 409 370, 414 376, 418 376 C 416 366, 414 348, 410 326 C 407 310, 403 300, 397 300 Z"
                fill="#FACC15"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Right Hamstring Outer (Rubí) */}
              <path
                d="M 410 298 C 422 306, 430 322, 434 340 C 436 352, 435 362, 432 370 L 424 366 C 422 350, 419 332, 414 312 Z"
                fill={hamstringsColor}
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </g>

            {/* Calves Gastrocnemius (Gemelos - Oro Yellow diamond/heart shape matching Image 4) */}
            <g id="back-calves" {...getMuscleProps('pantorrillas')}>
              {/* Left Gastrocnemius */}
              <path
                d="M 368 382 C 358 392, 354 408, 356 426 C 358 438, 364 446, 368 450 C 372 444, 376 432, 376 418 C 376 402, 374 390, 368 382 Z"
                fill={calvesColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Right Gastrocnemius */}
              <path
                d="M 422 382 C 432 392, 436 408, 434 426 C 432 438, 426 446, 422 450 C 418 444, 414 432, 414 418 C 414 402, 416 390, 422 382 Z"
                fill={calvesColor}
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* Interactive Helper Banner */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
        <span className="text-[#8E8E93] flex items-center gap-1.5">
          <span>👆</span>
          <span>Toca cualquier músculo para ver sus ejercicios y rangos</span>
        </span>
        {hoveredMuscle && (
          <span
            className="font-black uppercase tracking-wider px-2 py-0.5 rounded-full border text-[10px]"
            style={{
              backgroundColor: `${getColor(hoveredMuscle)}20`,
              color: getColor(hoveredMuscle),
              borderColor: `${getColor(hoveredMuscle)}40`,
            }}
          >
            {muscleTiers[hoveredMuscle]?.label}
          </span>
        )}
      </div>
    </div>
  );
};
