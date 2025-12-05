import { Dimensions, Platform } from 'react-native';

// Detecção de plataforma web
export const isWeb = Platform.OS === 'web';

// Dimensões da tela
const { width: screenWidth } = Dimensions.get('window');

export const WebConfig = {
  // Layout constraints para web
  maxWidth: isWeb ? Math.min(screenWidth, 500) : screenWidth,
  centerHorizontally: isWeb && screenWidth > 768,
  
  // Padding responsivo
  horizontalPadding: isWeb ? (screenWidth > 768 ? 40 : 20) : 20,
  
  // Font scaling para web
  fontScale: isWeb ? Math.min(screenWidth / 375, 1.2) : 1,
  
  // Configurações de scroll
  scrollViewProps: isWeb ? {
    contentContainerStyle: { 
      minHeight: '100vh',
      width: '100%',
      maxWidth: 500,
      margin: '0 auto'
    },
    style: { width: '100%' }
  } : {},
  
  // Estilos específicos para web
  webContainerStyle: isWeb ? {
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    minHeight: '100vh',
    boxSizing: 'border-box'
  } : {},
  
  // Viewport meta programática
  setViewportMeta: () => {
    if (isWeb && typeof document !== 'undefined') {
      let viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
      if (!viewport) {
        viewport = document.createElement('meta') as HTMLMetaElement;
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      
      // Adicionar CSS customizado
      const existingStyle = document.getElementById('bncc-web-styles');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'bncc-web-styles';
        style.innerHTML = `
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          
          #root {
            width: 100%;
            min-height: 100vh;
            display: flex;
            justify-content: center;
          }
          
          @media (min-width: 768px) {
            #root {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 20px 0;
            }
          }
          
          /* Prevent zoom on input focus */
          input, textarea, select {
            font-size: 16px !important;
          }
          
          /* Hide scrollbars but keep functionality */
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
};

// Hook para aplicar configurações web
export const useWebLayout = () => {
  if (isWeb) {
    // Aplicar configurações no mount
    setTimeout(() => {
      WebConfig.setViewportMeta();
    }, 0);
  }
  
  return {
    isWeb,
    containerStyle: WebConfig.webContainerStyle,
    maxWidth: WebConfig.maxWidth,
    horizontalPadding: WebConfig.horizontalPadding,
    fontScale: WebConfig.fontScale
  };
};

export default WebConfig;