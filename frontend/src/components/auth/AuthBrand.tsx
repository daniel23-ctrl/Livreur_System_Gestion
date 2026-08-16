import { Truck } from "lucide-react";

export default function AuthBrand() {
    return (
        <div className="flex items-center justify-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">

                <Truck
                    size={24}
                    className="text-green-900"
                />

            </div>

            <div>

                <h1 className="text-2xl font-extrabold text-slate-800">
                    KAUZA
                </h1>

                <p className="text-sm text-slate-500">
                    Gestion &amp; Supervision de Livraisons
                </p>

            </div>

        </div>
    );
}