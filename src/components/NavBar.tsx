import { Home, Menu, User } from "lucide-react";

export function NavBar() {
    return (
        <div>
            <div className="min-w-5xl m-10 flex justify-between rounded-3xl border border-[#25303A] bg-[#141A1E]">
                <h2 className="p-5">
                    <p className="inline-block text-[#FF6B2C] text-3xl font-bold">
                        Shift
                    </p>
                    <p className="inline-block text-4xl font-bold">K</p>
                    <p className="inline-block text-3xl font-bold">aro</p>
                </h2>
                <div className="flex items-center p-5 space-x-5">
                    <div className="hover:text-[#FF6B2C]">
                        <Home />
                    </div>

                    <div className="hover:text-[#FF6B2C]">
                        <Menu />
                    </div>

                    <div className="hover:text-[#FF6B2C]">
                        <User />
                    </div>
                </div>
            </div>
        </div>
    );
}
