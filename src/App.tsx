import React, { useState, useEffect } from "react";
import { HeaderNavbar } from "./components/HeaderNavbar";
import { SopDocView } from "./components/SopDocView";
import { BaganAlirPosView } from "./components/BaganAlirPosView";
import { UserRoleModal } from "./components/UserRoleModal";
import {
  ToastNotification,
  ToastMessage,
} from "./components/ToastNotification";
import { LoginView } from "./components/LoginView";
import { AccountSecurityModal } from "./components/AccountSecurityModal";
import { DatabaseLaragonModal } from "./components/DatabaseLaragonModal";
import {
  INITIAL_SOP_DOCUMENT,
  INITIAL_USERS,
  INITIAL_BAGAN_ALIR_STEPS,
} from "./data/initialData";
import { SopDocument, UserProfile, BaganAlirStep } from "./types";
import { Building2, HelpCircle, ShieldCheck, FileText } from "lucide-react";
import { checkIsAuthenticated, logoutSession } from "./utils/authService";
import { getAllSopDocuments, initDatabase } from "./utils/database";

export default function App() {
  // Authentication State: website strictly protected, blocked unless authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    checkIsAuthenticated(),
  );

  // App States
  const [sopDocument, setSopDocument] =
    useState<SopDocument>(INITIAL_SOP_DOCUMENT);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  // Active View Tab: Terfokus langsung pada Naskah POS AP dan Bagan Alir POS AP
  const [activeTab, setActiveTab] = useState<"sop" | "bagan-alir">("sop");
  const [baganAlirSteps, setBaganAlirSteps] = useState<BaganAlirStep[]>(
    INITIAL_BAGAN_ALIR_STEPS,
  );

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDbLaragonModalOpen, setIsDbLaragonModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load SOP Documents from persistent Database on mount
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        await initDatabase();
        const docs = await getAllSopDocuments();
        if (docs.length > 0) {
          setSopDocument(docs[0]);
        }
      } catch (err) {
        console.warn("Failed to load initial docs from database:", err);
      }
    };
    initializeAndLoad();
  }, []);

  // Toast Helper
  const addToast = (
    type: "success" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    logoutSession();
    setIsAuthenticated(false);
    addToast(
      "info",
      "Sesi Berakhir",
      "Anda telah berhasil keluar dari sistem aplikasi.",
    );
  };

  // STRICT GATEWAY: Jika belum login, website sama sekali tidak bisa dibuka
  if (!isAuthenticated) {
    return (
      <>
        <LoginView
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            addToast(
              "success",
              "Autentikasi Berhasil",
              "Selamat datang di SIM-SOP GTK Provinsi Gorontalo.",
            );
          }}
        />
        <ToastNotification toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Update SOP Document
  const handleUpdateSop = (updatedSop: SopDocument) => {
    setSopDocument(updatedSop);
    addToast(
      "success",
      "Database Diperbarui",
      `Naskah ${updatedSop.nomorPos} tersimpan di database.`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Official Government Header & Sticky Navigation */}
      <HeaderNavbar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          addToast(
            "info",
            "Sesi Pengguna Berubah",
            `Masuk sebagai ${u.name} (${u.roleTitle}).`,
          );
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sopDocument={sopDocument}
        baganAlirSteps={baganAlirSteps}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenDatabaseModal={() => setIsDbLaragonModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "sop" && (
          <SopDocView
            sop={sopDocument}
            onUpdateSop={handleUpdateSop}
            currentUser={currentUser}
          />
        )}

        {activeTab === "bagan-alir" && (
          <BaganAlirPosView sopDocument={sopDocument} steps={baganAlirSteps} />
        )}
      </main>

      {/* Guide Callout */}
      <section className="print:hidden bg-white border-t border-slate-200 mt-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">
                  Naskah Resmi &amp; Bagan Alir
                </h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed text-xs">
                  Aplikasi berfokus penuh pada penyajian{" "}
                  <strong>Naskah Resmi POS AP</strong> dan{" "}
                  <strong>Bagan Alir Operasional</strong> sesuai standar
                  PermenPAN-RB No. 35/2012.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">
                  Laporan Resmi (.PDF)
                </h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed text-xs">
                  Dapat dicetak langsung atau diunduh sebagai dokumen PDF resmi
                  lengkap dengan logo Kemendikdasmen dan stempel pengesahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="print:hidden bg-slate-900 text-slate-400 py-6 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-medium">
              Kantor Guru dan Tenaga Kependidikan Provinsi Gorontalo
            </span>
          </div>
          <div>
            &copy; 2026 Kementerian Pendidikan Dasar dan Menengah RI. Hak Cipta
            Dilindungi.
          </div>
        </div>
      </footer>

      {/* Security & Database Account Modal */}
      <AccountSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onSuccessToast={(title, msg) => addToast("success", title, msg)}
      />

      {/* MySQL Laragon Database & Data Changes Modal */}
      <DatabaseLaragonModal
        isOpen={isDbLaragonModalOpen}
        onClose={() => setIsDbLaragonModalOpen(false)}
        onSuccessToast={(title, msg) => addToast("success", title, msg)}
      />

      {/* User Role Modal */}
      <UserRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        allUsers={users}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          addToast(
            "info",
            "Sesi Pengguna Berubah",
            `Masuk sebagai ${u.name} (${u.roleTitle}).`,
          );
        }}
      />

      {/* Global Toast Notification System */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
