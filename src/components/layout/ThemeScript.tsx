export default function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('bazaarly-theme');
        var theme = stored ? JSON.parse(stored).state.theme : 'light';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
