# 🔧 Configurações Específicas para PWABuilder

## 📱 Configurações Android (TWA)

### **Package Information**

```
Package ID: com.confilar.app
App Name: ConfiLar - Marketplace de Serviços
Launcher Name: ConfiLar
Version Code: 1
Version Name: 1.0.0
Min SDK Version: 21 (Android 5.0)
Target SDK Version: 34 (Android 14)
```

### **Visual Settings**

```
Theme Color: #000000
Background Color: #9CA3AF
Navigation Color: #000000
Status Bar Style: default
Display Mode: standalone
Orientation: portrait
```

### **Advanced Settings**

```
Enable Site Settings Shortcut: true
Fallback Behavior: customtabs
Web Manifest URL: https://seusite.com.br/manifest.json
Start URL: https://seusite.com.br/
Scope: https://seusite.com.br/
```

### **App Shortcuts (Android)**

Já configurado no manifest.json:
- Buscar Profissionais → /buscar
- Mensagens → /mensagens  
- Classificados → /classificados

---

## 🍎 Configurações iOS

### **Bundle Information**

```
Bundle ID: com.confilar.app
Display Name: ConfiLar
Version: 1.0.0
Build Number: 1
Minimum iOS Version: 14.0
```

### **Capabilities**

```
☑ Push Notifications
☑ Background Modes
☑ Universal Links
☐ iCloud (opcional)
☐ Apple Pay (se implementar pagamentos)
```

### **Privacy Settings**

Adicionar no Info.plist:

```xml
<key>NSCameraUsageDescription</key>
<string>Precisamos acessar a câmera para você tirar fotos do seu perfil ou trabalhos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos acessar suas fotos para você escolher imagens do perfil ou trabalhos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Usamos sua localização para encontrar profissionais perto de você</string>
```

---

## 🔗 Deep Links / Universal Links

### **Android - Asset Links**

Criar arquivo: `public/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.confilar.app",
    "sha256_cert_fingerprints": [
      "ADICIONAR_SEU_SHA256_AQUI_DEPOIS_DO_BUILD"
    ]
  }
}]
```

**Como obter o SHA256:**
1. Após build no PWABuilder, baixe a keystore
2. Execute: `keytool -list -v -keystore release.keystore`
3. Copie o SHA256 fingerprint

### **iOS - Apple App Site Association**

Criar arquivo: `public/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.confilar.app",
        "paths": [
          "/perfil/*",
          "/classificados/*",
          "/buscar",
          "/feed",
          "*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAM_ID.com.confilar.app"]
  }
}
```

**Substituir:**
- `TEAM_ID` pelo seu Team ID da Apple Developer Account

---

## 🔔 Push Notifications

### **Android - Firebase Cloud Messaging (FCM)**

1. **Firebase Console**: https://console.firebase.google.com
2. Criar projeto "ConfiLar"
3. Adicionar app Android: `com.confilar.app`
4. Baixar `google-services.json`
5. Configurar no PWABuilder:
   - Upload do `google-services.json`
   - Enable Push Notifications: ☑

### **iOS - Apple Push Notification Service (APNs)**

1. Apple Developer Console
2. Certificates → Create Certificate
3. Apple Push Notification service SSL
4. Baixar certificado `.p8`
5. Configurar no Xcode:
   - Capabilities → Push Notifications
   - Upload certificado

---

## 🎨 Assets Adicionais

### **Splash Screens**

PWABuilder gera automaticamente, mas você pode customizar:

**Android:**
```
drawable-mdpi: 320x480
drawable-hdpi: 480x800
drawable-xhdpi: 720x1280
drawable-xxhdpi: 1080x1920
drawable-xxxhdpi: 1440x2560
```

**iOS:**
```
iPhone 14 Pro Max: 1290x2796
iPhone 14 Pro: 1179x2556
iPhone SE: 750x1334
iPad Pro 12.9": 2048x2732
```

### **App Store Assets**

**Google Play:**
```
Icon: 512x512 (PNG, 32-bit)
Feature Graphic: 1024x500 (JPG ou PNG)
Screenshots: 1080x1920 (mínimo 2, máximo 8)
Promo Video: YouTube URL (opcional)
```

**Apple App Store:**
```
Icon: 1024x1024 (PNG, sem transparência)
Screenshots:
  - iPhone 6.7": 1290x2796 (2-10 screenshots)
  - iPhone 6.5": 1242x2688 (2-10 screenshots)
  - iPad Pro: 2048x2732 (2-10 screenshots)
App Preview: até 30 segundos (opcional)
```

---

## 📝 Metadados da Loja

### **Descrição Curta (Google Play)**

```
ConfiLar - Conecte-se diretamente com profissionais de confiança. 
Sem intermediários, sem taxas ocultas. Encontre, avalie e contrate.
```

### **Descrição Completa (Google Play)**

```
🏡 ConfiLar - O Marketplace que Conecta Você Diretamente aos Profissionais

Cansado de intermediários que encarecem os serviços? No ConfiLar, você se conecta 
diretamente com profissionais verificados da sua região!

✨ PRINCIPAIS RECURSOS:

🔍 Busca Inteligente
- Encontre profissionais por categoria e localização
- Filtros avançados por avaliação, distância e disponibilidade
- Resultados em tempo real

💬 Comunicação Direta
- Chat integrado sem intermediários
- Negocie valores e condições diretamente
- Histórico completo de conversas

⭐ Sistema de Reputação
- Avaliações verificadas de clientes reais
- Recomendações entre profissionais
- Portfólio de trabalhos realizados

📢 Classificados
- Anúncios de serviços oferecidos e solicitados
- Geolocalização para encontrar próximo de você
- Notificações em tempo real

🔒 Segurança e Confiança
- Perfis verificados
- Sistema de denúncias
- Acordos documentados

💰 Zero Taxas para Clientes
- Sem mensalidades
- Sem taxas de intermediação
- Pagamento direto ao profissional

CATEGORIAS:
Reformas, Eletricista, Encanador, Pintor, Pedreiro, Jardineiro, Diarista, 
Cuidador, Professor, e muito mais!

📱 Baixe agora e encontre o profissional perfeito para seu projeto!
```

### **Palavras-chave (SEO)**

```
marketplace, serviços, profissionais, reformas, construção, 
manutenção, pedreiro, eletricista, encanador, diarista, 
freelancer, autônomo, trabalho, emprego, negócios locais
```

### **Categoria**

- **Google Play**: Negócios
- **App Store**: Business ou Productivity

---

## 🔐 Políticas Obrigatórias

### **Política de Privacidade**

URL pública obrigatória: `https://seusite.com.br/privacidade`

Deve incluir:
- Quais dados coletamos
- Como usamos os dados
- Compartilhamento com terceiros
- Direitos do usuário (LGPD)
- Como deletar conta

### **Termos de Uso**

URL: `https://seusite.com.br/termos`

Deve incluir:
- Regras de uso da plataforma
- Direitos e responsabilidades
- Proibições
- Cancelamento de conta

### **Contato do Desenvolvedor**

Email obrigatório para suporte:
```
suporte@confilar.com.br
```

---

## 🧪 Testes Antes de Publicar

### **Checklist de Testes**

- [ ] App instala corretamente
- [ ] Ícone aparece correto no launcher
- [ ] Splash screen exibe
- [ ] Todas as páginas carregam
- [ ] Login/Logout funciona
- [ ] Push notifications funcionam
- [ ] Deep links abrem corretamente
- [ ] App funciona offline
- [ ] Câmera/galeria funcionam (se usar)
- [ ] Compartilhamento funciona
- [ ] Sem crashes ou erros

### **Ferramentas de Teste**

**Android:**
```bash
# Instalar APK no dispositivo via ADB
adb install -r app-release.aab

# Ver logs
adb logcat | grep ConfiLar
```

**iOS:**
- TestFlight (distribuição beta)
- Simulador do Xcode

---

## 📊 Analytics e Monitoramento

### **Google Analytics 4**

Adicionar no app para tracking:

```javascript
// gtag.js já configurado no projeto
gtag('event', 'app_install', {
  'app_name': 'ConfiLar',
  'app_version': '1.0.0'
})
```

### **Firebase Analytics**

Eventos personalizados úteis:
- `user_search` - Quando busca profissional
- `message_sent` - Quando envia mensagem
- `profile_view` - Quando vê perfil
- `ad_click` - Quando clica em classificado

---

## 🚀 Após Publicação

### **Monitoramento**

1. **Google Play Console:**
   - Acompanhar reviews
   - Ver relatórios de crashes
   - Métricas de instalação

2. **App Store Connect:**
   - Reviews e avaliações
   - Crash reports
   - Analytics de uso

### **Updates**

Para atualizar o app:
1. Fazer alterações no site
2. Atualizar Version Code/Number
3. Gerar novo build no PWABuilder
4. Upload na loja
5. Aguardar aprovação (1-7 dias)

### **Promoção**

- Adicionar badge no site: "Baixe nosso app"
- Posts nas redes sociais
- Email marketing para usuários
- ASO (App Store Optimization)

---

## 📞 Recursos Adicionais

- **PWABuilder Docs**: https://docs.pwabuilder.com
- **Android Developers**: https://developer.android.com
- **Apple Developer**: https://developer.apple.com
- **TWA Guide**: https://web.dev/using-a-pwa-in-your-android-app/

---

**Última Atualização**: Janeiro 2025  
**ConfiLar App v1.0.0**


