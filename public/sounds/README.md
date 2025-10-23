# 🔊 Pasta de Sons de Notificações

## 📝 Como Adicionar Sons

### 1. Baixar Sons Gratuitos

**Sites Recomendados:**
- [Pixabay Sounds](https://pixabay.com/sound-effects/) - 100% gratuito
- [Freesound](https://freesound.org/) - Creative Commons
- [Zapsplat](https://www.zapsplat.com/) - Gratuito com atribuição

### 2. Especificações dos Sons

- **Formato:** MP3 (melhor compatibilidade)
- **Qualidade:** 128kbps (suficiente para notificações)
- **Duração:** 0.5s a 2s (máximo)
- **Tamanho:** < 100kb por arquivo
- **Volume:** Normalizado (-3dB a -6dB)

### 3. Sons Necessários

Você precisa adicionar estes arquivos de som nesta pasta:

#### 📢 Notificações
- [ ] `message.mp3` - Mensagem de chat
- [ ] `chat.mp3` - Chat geral
- [ ] `booking.mp3` - Agendamento
- [ ] `favorite.mp3` - Favorito
- [ ] `follow.mp3` - Novo seguidor
- [ ] `profile-view.mp3` - Visualização de perfil
- [ ] `like.mp3` - Curtida
- [ ] `comment.mp3` - Comentário
- [ ] `reminder.mp3` - Lembrete

#### 🏆 Conquistas
- [ ] `achievement.mp3` - Conquista geral
- [ ] `review.mp3` - Avaliação
- [ ] `evaluation.mp3` - Avaliação recebida
- [ ] `recommendation.mp3` - Recomendação
- [ ] `reputation.mp3` - Reputação
- [ ] `portfolio.mp3` - Portfolio

#### 🎉 Sistema de Referral (IMPORTANTE!)
- [ ] `referral-signup.mp3` - Nova indicação se cadastrou (50pts)
- [ ] `referral-profile.mp3` - Indicação completou perfil (50pts)
- [ ] `referral-post.mp3` - Indicação fez primeiro post (30pts)
- [ ] `referral-review.mp3` - Indicação fez primeira avaliação (100pts)
- [ ] `referral-30days.mp3` - Indicação 30 dias ativo (150pts)
- [ ] `referral-tier.mp3` - Subiu de tier/nível 🏆
- [ ] `referral-badge.mp3` - Ganhou novo badge 🥇
- [ ] `referral-complete.mp3` - Indicação completou tudo
- [ ] `referral-welcome.mp3` - Boas-vindas ao indicado

#### ✅ Sucesso
- [ ] `success.mp3` - Sucesso geral
- [ ] `verification.mp3` - Verificação
- [ ] `success-confirm.mp3` - Confirmação

#### ⚠️ Alertas
- [ ] `warning.mp3` - Aviso
- [ ] `error.mp3` - Erro
- [ ] `security.mp3` - Segurança

#### ℹ️ Informações
- [ ] `info.mp3` - Informação geral
- [ ] `system.mp3` - Sistema
- [ ] `admin.mp3` - Admin
- [ ] `maintenance.mp3` - Manutenção
- [ ] `update.mp3` - Atualização
- [ ] `availability.mp3` - Disponibilidade

### 4. Sons Extras (Opcional)

Você também pode adicionar sons alternativos:

- `notification-soft.mp3` - Som suave
- `notification-modern.mp3` - Som moderno
- `achievement-epic.mp3` - Conquista épica
- `achievement-victory.mp3` - Vitória
- `success-happy.mp3` - Sucesso feliz
- `alert-important.mp3` - Alerta importante
- `alert-urgent.mp3` - Alerta urgente
- `info-simple.mp3` - Info simples

### 5. Ferramentas para Editar Sons

**Online:**
- [TwistedWave Online](https://twistedwave.com/online)
- [Audio Trimmer](https://audiotrimmer.com/)
- [MP3 Cutter](https://mp3cut.net/)

**Desktop:**
- Audacity (gratuito)
- Adobe Audition (pago)

### 6. Converter para MP3

Se baixar em outro formato (WAV, OGG, etc):

**Online:**
- [CloudConvert](https://cloudconvert.com/wav-to-mp3)
- [Online Audio Converter](https://online-audio-converter.com/)

**Linha de comando:**
```bash
# Usando FFmpeg
ffmpeg -i input.wav -b:a 128k -ar 44100 output.mp3
```

### 7. Normalizar Volume

Para garantir que todos os sons tenham volume similar:

```bash
# Usando FFmpeg
ffmpeg -i input.mp3 -filter:a "volume=-6dB" output.mp3
```

### 8. Testar os Sons

Depois de adicionar os arquivos, acesse:

```
http://localhost:3000/teste-sons
```

Lá você pode testar todos os sons e aprovar/reprovar.

---

## 🎨 Sugestões de Estilo de Som

### Para Notificações Normais
- Som curto e discreto (0.5s)
- Tom médio/agudo
- Não muito alto
- Exemplo: "pop", "ding", "boop"

### Para Conquistas
- Som mais longo (1-2s)
- Tom ascendente
- Mais empolgante
- Exemplo: fanfare curta, "level up", sinos

### Para Alertas
- Som chamativo
- Tom grave/médio
- Repetitivo ou pulsante
- Exemplo: "beep beep", sino de alerta

### Para Sucesso
- Som positivo
- Tom agudo
- Alegre
- Exemplo: "ding", "chime", "success"

### Para Referral (Indicações)
- Sons épicos e recompensadores!
- Mais longos que notificações normais
- Empolgantes
- Valorizam a conquista do usuário

---

## ✅ Status Atual

**Arquivos Adicionados:** 0 de 35

**Próximos Passos:**
1. Baixar sons dos sites recomendados
2. Converter para MP3 (128kbps)
3. Renomear conforme lista acima
4. Colocar nesta pasta
5. Testar em `/teste-sons`

---

## 🆘 Ajuda

Se precisar de ajuda, consulte:
- `docs/SISTEMA_SONS_NOTIFICACOES.md` - Documentação completa
- `/teste-sons` - Página de teste
- `src/types/sound.ts` - Configurações dos sons

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0

