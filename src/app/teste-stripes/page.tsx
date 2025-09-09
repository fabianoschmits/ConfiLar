export default function TesteRadialPage() {
  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 60%, #f1f5f9 100%)",
        }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Teste do Padrão Radial Gradient
          </h1>
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              ConfiLar - Marketplace de Serviços
            </h2>
            <p className="text-gray-600 mb-4">
              Se você está vendo este fundo com gradiente radial do topo, o padrão está funcionando!
            </p>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Padrão Radial Gradient Funcionando!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
