const webpush = require('web-push')

console.log('🔑 Gerando chaves VAPID para notificações push...\n')

try {
  // Gerar chaves VAPID
  const vapidKeys = webpush.generateVAPIDKeys()
  
  console.log('✅ Chaves VAPID geradas com sucesso!\n')
  
  console.log('📋 Adicione estas variáveis ao seu arquivo .env:\n')
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
  
  console.log('\n📝 Instruções:')
  console.log('1. Copie as chaves acima')
  console.log('2. Adicione ao arquivo .env na raiz do projeto')
  console.log('3. Reinicie o servidor de desenvolvimento')
  console.log('4. Teste as notificações push no navegador')
  
  console.log('\n🔧 Configuração no Supabase:')
  console.log('As chaves também devem ser configuradas no Supabase para o envio de notificações.')
  
  console.log('\n🧪 Para testar:')
  console.log('1. Acesse as configurações de notificações')
  console.log('2. Clique em "Ativar Notificações Push"')
  console.log('3. Permita as notificações no navegador')
  console.log('4. Verifique se a subscription foi salva no banco')
  
} catch (error) {
  console.error('❌ Erro ao gerar chaves VAPID:', error.message)
  console.log('\n💡 Solução:')
  console.log('1. Instale o web-push: npm install web-push')
  console.log('2. Execute novamente: node scripts/generate-vapid-keys.js')
}
