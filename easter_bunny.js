// Easter Bunny Splash Overlay

(function() {
  const styles = document.createElement('style');
  styles.textContent = `
    .easter-splash {
      width: 480px;
      height: 360px;
      background: transparent;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      overflow: hidden;
      font-family: monospace;
      pointer-events: none;
      z-index: 9999;
    }
    .easter-bunny {
      position: absolute;
      font-size: 9px;
      line-height: 1.1;
      white-space: pre;
      color: #fff;
      text-shadow: 0 0 8px rgba(255,255,255,0.5);
      transition: left 0.5s ease-in-out;
    }
    .easter-bunny.hop {
      animation: easterHop 0.5s ease-out;
    }
    @keyframes easterHop {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    .easter-egg {
      position: absolute;
      font-size: 10px;
      line-height: 1.05;
      white-space: pre;
      text-shadow: 0 0 10px currentColor;
    }
    .easter-grass {
      position: absolute;
      bottom: 0;
      width: 100%;
      color: #52b788;
      font-size: 14px;
      line-height: 1.2;
      white-space: pre;
      text-shadow: 0 0 8px #40916c;
      overflow: hidden;
    }
  `;
  document.head.appendChild(styles);

  const splash = document.createElement('div');
  splash.className = 'easter-splash';

  const bunnyArt = `             ,
            /|      __
           / |   ,-~ /
          Y :|  //  /
          | jj /( .^
          >-"~"-v"
         /       Y
        jo  o    |
       ( ~T~     j
        >._-' _./
       /   "~"  |
      Y     _,  |
     /| ;-"~ _  l
    / l/ ,-"~    \\
    \\//\\/      .- \\
     Y        /    Y  
     l       I     !
     ]\\      _\\    /"\\
    (" ~----( ~   Y.  )
~~~~~~~~~~~~~~~~~~~~~~~~~`;

  const eggs = [
    { left: 25, color: '#FF69B4', pattern: `  ,--.\n / ~~ \\\n( ~  ~ )\n \\ ~~ /\n  '--'` },
    { left: 80, color: '#FFD700', pattern: `  ,--.\n /|  |\\\n( |  | )\n \\|  |/\n  '--'` },
    { left: 390, color: '#9370DB', pattern: `  ,--.\n /*..*\\\n( *  * )\n \\*..*/\n  '--'` },
    { left: 440, color: '#20B2AA', pattern: `  ,--.\n /\\  /\\\n( <  > )\n \\/  \\/\n  '--'` }
  ];

  eggs.forEach(egg => {
    const eggEl = document.createElement('div');
    eggEl.className = 'easter-egg';
    eggEl.style.cssText = `left: ${egg.left}px; bottom: 85px; color: ${egg.color};`;
    eggEl.textContent = egg.pattern;
    splash.appendChild(eggEl);
  });

  const bunny = document.createElement('div');
  bunny.className = 'easter-bunny';
  bunny.textContent = bunnyArt;
  bunny.style.left = '140px';
  bunny.style.bottom = '70px';
  splash.appendChild(bunny);

  const grass = document.createElement('div');
  grass.className = 'easter-grass';
  const grassChars = ['w', 'v', 'V', 'W', 'M', 'w', 'Y', 'v', 'W', 'v', 'm'];
  let grassText = '';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 80; col++) {
      grassText += grassChars[Math.floor(Math.random() * grassChars.length)];
    }
    grassText += '\n';
  }
  grass.textContent = grassText;
  splash.appendChild(grass);

  document.body.appendChild(splash);

  // Bunny hopping animation
  const positions = [140, 220, 140, 100];
  let posIndex = 0;

  setInterval(() => {
    bunny.classList.add('hop');
    posIndex = (posIndex + 1) % positions.length;
    bunny.style.left = positions[posIndex] + 'px';
    setTimeout(() => bunny.classList.remove('hop'), 500);
  }, 1200);
})();
