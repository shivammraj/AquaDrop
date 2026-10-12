@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  font-family: Inter, 'Segoe UI', sans-serif;
  background: #f1f8ff;
  color: #13294b;
}

html[data-theme='dark'] {
  color-scheme: dark;
  background: #0c1729;
  color: #edf7ff;
}

html[data-theme='dark'] body {
  background: #0c1729;
  color: #edf7ff;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f1f8ff;
}

button,
input,
select {
  font: inherit;
}

img {
  max-width: 100%;
  display: block;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-pop-in {
  animation: pop-in 180ms ease-out;
}
