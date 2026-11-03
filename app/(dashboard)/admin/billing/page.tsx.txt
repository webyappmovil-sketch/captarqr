export default function AdminBillingPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Facturación</h2>
      <p className="text-gray-400 text-sm mb-6">
        Pagos, facturas y suscripciones
      </p>
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        Sin facturación registrada.
      </div>
    </div>
  );
}