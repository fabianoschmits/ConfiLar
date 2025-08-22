import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API de upload iniciada...');
    
    // Verificar variáveis de ambiente em runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' }, 
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Arquivo e userId são obrigatórios' }, 
        { status: 400 }
      );
    }

    console.log('📁 Arquivo recebido:', file.name, file.size, 'bytes');
    console.log('👤 Usuário:', userId);

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado' }, 
        { status: 400 }
      );
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' }, 
        { status: 400 }
      );
    }

    // Gerar nome único
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    console.log('📁 Nome do arquivo:', fileName);

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Erro no upload:', error);
      return NextResponse.json(
        { error: `Erro no upload: ${error.message}` }, 
        { status: 500 }
      );
    }

    console.log('✅ Upload realizado com sucesso:', data);

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('🔗 URL pública:', publicUrl);

    // Atualizar perfil do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      return NextResponse.json(
        { error: `Erro ao atualizar perfil: ${updateError.message}` }, 
        { status: 500 }
      );
    }

    console.log('✅ Perfil atualizado com sucesso');
    console.log('🎉 Upload de avatar concluído!');

    return NextResponse.json({ 
      success: true, 
      avatarUrl: publicUrl,
      message: 'Avatar atualizado com sucesso!' 
    });

  } catch (error) {
    console.error('💥 Erro crítico na API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}
