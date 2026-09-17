import { Home, Menu, User } from "lucide-react";

export function NavBar() {
    return (
        <div>
            <div className="min-w-5xl m-10 flex justify-between rounded-3xl border border-[#25303A] bg-[#141A1E]">
                <h2 className="p-5">
                    <p className="inline-block text-[#FF6B2C] text-3xl font-bold">
                        Mark
                    </p>
                    <p className="inline-block text-white text-3xl font-bold">IT</p>
                </h2>
                <div className="flex items-center p-5 space-x-5">
                    <div className="hover:text-[#FF6B2C] text-white ">
                        <Home />
                    </div>

                    <div className="hover:text-[#FF6B2C] text-white ">
                        <Menu />
                    </div>

                    <div className="hover:text-[#FF6B2C] text-white ">
                        <User />
                    </div>
                </div>
            </div>
        </div>
    );
}
