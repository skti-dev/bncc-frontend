import { Dimensions, Platform } from 'react-native';

// Detecção de plataforma web
export const isWeb = Platform.OS === 'web';

// Dimensões da tela
const { width: screenWidth } = Dimensions.get('window');

export const WebConfig = {
  // Layout constraints para web - menos restritivo
  maxWidth: isWeb ? screenWidth : screenWidth,
  centerHorizontally: isWeb && screenWidth > 1024, // só desktop grande
  
  // Padding natural para mobile
  horizontalPadding: isWeb ? (screenWidth > 1024 ? 20 : 0) : 20,
  
  // Font scaling natural
  fontScale: 1,
  
  // Configurações simplificadas de scroll
  scrollViewProps: isWeb ? {
    contentContainerStyle: { 
      width: '100%'
    },
    style: { width: '100%' }
  } : {},
  
  // Estilos mínimos para web
  webContainerStyle: isWeb ? {
    width: '100%'
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
      viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
      
      // Adicionar CSS customizado
      const existingStyle = document.getElementById('bncc-web-styles');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'bncc-web-styles';
        style.innerHTML = `
          /* Minimal styles for mobile-first */
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Desktop only enhancements */
          @media (min-width: 1024px) {
            #root {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 20px 0;
            }
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