module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        primary: '#1677FF',
        accent: '#249BFF',
        deepNavy: '#102A56',
        lightCyan: '#BCEEFF',
        ice: '#F1F8FF',
        primaryText: '#13294B',
        secondaryText: '#60738F',
        border: '#DCE8F7',
        success: '#24B47E',
        warning: '#F3A847',
        darkNotification: '#172437'
      },
      borderRadius: {
        xl: '20px'
      }
    }
  },
  plugins: []
}
