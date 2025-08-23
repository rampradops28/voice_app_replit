import { useAuth } from "../hooks/useAuth";
import { useBilling } from "../hooks/useBilling";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { handleVoiceCommand } from "../lib/ParseVoiceCommand";
import { generateInvoicePDF } from "../lib/GenerateInvoicePDF";
import { useToast } from "../hooks/use-toast";
import LearningAssistant from "../components/LearningAssistant";
import SMSIntegration from "../components/SMSIntegration";
import VoiceSetupGuide from "../components/VoiceSetupGuide";
import ManualInputPanel from "../components/ManualInputPanel";
import VoiceTestButton from "../components/VoiceAuthentication";
import { useQuery } from "@tanstack/react-query";
import VoiceControlPanel from "../components/VoiceControlPanel";
import BillingInterface from "../components/BillingInterface";
import QuickStats from "../components/QuickStats";
import { Button } from "@/components/ui/button";
import { LogOut, Mic, AlertCircle, Keyboard } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { user, sessionId, logout } = useAuth();
  const [customerPhone, setCustomerPhone] = useState("");
  const [currentMode, setCurrentMode] = useState("billing"); // removed TS union type
  const [showSMSIntegration, setShowSMSIntegration] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(false);
  const { toast } = useToast();

  const billing = useBilling(user?.id || "", sessionId || "");

  const { data: stats } = useQuery({
    queryKey: ["/api/stats", user?.id],
    enabled: !!user?.id,
  });

  const handleGenerateInvoice = () => {
    if (billing.billItems.length === 0) {
      toast({
        title: "No Items",
        description: "Add items to generate invoice",
        variant: "destructive",
      });
      return;
    }

    try {
      generateInvoicePDF({
        billItems: billing.billItems,
        totalAmount: billing.totalAmount,
        customerPhone: customerPhone || undefined,
      });

      if (customerPhone) {
        billing.updateBill(customerPhone);
      }

      toast({
        title: "PDF Generated",
        description: "Invoice downloaded successfully",
      });

      setShowSMSIntegration(true);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  const onVoiceCommand = (command) => {
    if (!user?.id || !sessionId) return;

    const context = {
      addItem: billing.addItem,
      removeItem: billing.removeItem,
      clearBill: billing.clearBill,
      totalAmount: billing.totalAmount,
      billItems: billing.billItems,
      generateInvoice: handleGenerateInvoice,
      stopListening: voice.stopListening,
    };

    handleVoiceCommand(command, context, { voiceFeedback: voiceFeedbackEnabled });
  };

  const voice = useVoiceRecognition(onVoiceCommand);

  if (!user || !sessionId) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Mic className="text-white text-lg w-5 h-5" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold text-gray-900"
                  data-testid="text-app-title"
                >
                  VoiceBill Pro
                </h1>
                <p
                  className="text-sm text-gray-500"
                  data-testid="text-welcome-message"
                >
                  Welcome, {user.name}
                </p>
              </div>
            </div>

            {/* Voice Status Indicator */}
            <div
              className="flex items-center space-x-2"
              data-testid="voice-status-indicator"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  voice.isListening ? "bg-success animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {voice.isListening ? "Listening..." : "Voice Inactive"}
              </span>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <VoiceControlPanel
              isListening={voice.isListening}
              isSupported={voice.isSupported}
              lastCommand={voice.lastCommand}
              onToggleListening={voice.toggleListening}
              onLanguageChange={(lang) => {
                voice.setLanguage(lang);
                toast({
                  title: "Language Updated",
                  description: `Voice recognition language changed to ${
                    lang === "en-US" ? "English" : lang === "ta-IN" ? "Tamil" : "Mixed"
                  }`,
                });
              }}
              onVoiceFeedbackChange={setVoiceFeedbackEnabled}
              voiceFeedbackEnabled={voiceFeedbackEnabled}
            />

            {/* Voice Test and Setup */}
            <VoiceTestButton />

            {!voice.isSupported && !showVoiceGuide && (
              <Button
                onClick={() => setShowVoiceGuide(true)}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                data-testid="button-show-voice-guide"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Voice Setup Help
              </Button>
            )}

            {showVoiceGuide && (
              <VoiceSetupGuide onDismiss={() => setShowVoiceGuide(false)} />
            )}

            {/* Manual Input Panel */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowManualInput(!showManualInput)}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                data-testid="button-toggle-manual-input"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                {showManualInput ? "Hide" : "Show"} Manual Input
              </Button>

              {showManualInput && (
                <ManualInputPanel onCommand={onVoiceCommand} />
              )}
            </div>
          </div>

          {/* Billing Interface */}
          <div className="lg:col-span-2">
            <BillingInterface
              billItems={billing.billItems}
              totalAmount={billing.totalAmount}
              isLoading={billing.isLoading}
              onRemoveItem={billing.removeItem}
              onResetBill={billing.clearBill}
              onGenerateInvoice={handleGenerateInvoice}
              customerPhone={customerPhone}
              onCustomerPhoneChange={setCustomerPhone}
            />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={() => setCurrentMode("billing")}
              variant={currentMode === "billing" ? "default" : "outline"}
              className="min-w-32"
              data-testid="button-billing-mode"
            >
              Billing Mode
            </Button>
            <Button
              onClick={() => setCurrentMode("learning")}
              variant={currentMode === "learning" ? "default" : "outline"}
              className="min-w-32"
              data-testid="button-learning-mode"
            >
              Learning Mode
            </Button>
          </div>

          {currentMode === "learning" && user?.id && (
            <LearningAssistant userId={user.id} onVoiceCommand={onVoiceCommand} />
          )}

          {currentMode === "billing" && (
            <>
              {/* Quick Stats */}
              <QuickStats stats={stats} />

              {/* SMS Integration Modal */}
              {showSMSIntegration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <SMSIntegration
                      customerPhone={customerPhone}
                      invoiceData={{
                        totalAmount: billing.totalAmount,
                        itemCount: billing.billItems.length,
                      }}
                      onSMSSent={() => setShowSMSIntegration(false)}
                    />
                    <Button
                      onClick={() => setShowSMSIntegration(false)}
                      variant="outline"
                      className="w-full mt-4"
                      data-testid="button-close-sms"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
