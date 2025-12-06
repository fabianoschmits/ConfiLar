/**
 * Validação de arquivos usando magic bytes (assinaturas de arquivo)
 * Previne upload de arquivos maliciosos disfarçados
 */

// Magic bytes para tipos de imagem comuns
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46], // WEBP (RIFF)
  ],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
};

/**
 * Lê os primeiros bytes de um arquivo
 */
async function readFileHeader(
  file: File,
  bytes: number = 12,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(e.target.result));
      } else {
        reject(new Error("Erro ao ler arquivo"));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, bytes));
  });
}

/**
 * Verifica se os bytes do arquivo correspondem à assinatura esperada
 */
function matchesSignature(fileBytes: Uint8Array, signature: number[]): boolean {
  if (fileBytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (fileBytes[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Valida o tipo real do arquivo usando magic bytes
 * Retorna true se o arquivo corresponde ao tipo MIME declarado
 */
export async function validateFileType(
  file: File,
  expectedMimeType: string,
): Promise<boolean> {
  // Verificar se o tipo MIME é suportado
  if (!IMAGE_SIGNATURES[expectedMimeType]) {
    console.warn(
      `Tipo MIME ${expectedMimeType} não tem validação de magic bytes`,
    );
    return true; // Permitir se não tiver validação específica
  }

  try {
    // Ler os primeiros bytes do arquivo
    const fileHeader = await readFileHeader(file, 12);

    // Verificar se corresponde a alguma das assinaturas esperadas
    const signatures = IMAGE_SIGNATURES[expectedMimeType];
    return signatures.some((signature) =>
      matchesSignature(fileHeader, signature),
    );
  } catch (error) {
    console.error("Erro ao validar tipo de arquivo:", error);
    return false;
  }
}

/**
 * Valida tamanho do arquivo
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
}

/**
 * Validação completa de arquivo de imagem
 */
export async function validateImageFile(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSizeMB?: number;
    validateMagicBytes?: boolean;
  } = {},
): Promise<{ valid: boolean; error?: string }> {
  const {
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    maxSizeMB = 5,
    validateMagicBytes = true,
  } = options;

  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`,
    };
  }

  // Validar tamanho
  if (!validateFileSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`,
    };
  }

  // Validar magic bytes se habilitado
  if (validateMagicBytes) {
    const isValidType = await validateFileType(file, file.type);
    if (!isValidType) {
      return {
        valid: false,
        error:
          "Tipo de arquivo não corresponde ao conteúdo real. Arquivo pode estar corrompido ou ser malicioso.",
      };
    }
  }

  return { valid: true };
}
