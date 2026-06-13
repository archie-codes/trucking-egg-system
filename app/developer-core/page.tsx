"use client";

import { useState, useEffect } from "react";
import {
  getSystemLockStatus,
  toggleSystemLock,
  updateMasterPin,
} from "@/app/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ShieldAlert,
  Loader2,
  KeyRound,
  Type,
  LockKeyhole,
} from "lucide-react";

export default function DeveloperCorePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [reason, setReason] = useState("");
  const [pin, setPin] = useState("");

  // PIN Change State
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    getSystemLockStatus().then((res) => {
      setIsLocked(res.isLocked);
      setReason(res.reason || "");
      setLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    if (!pin || pin.trim() === "") {
      toast.error("Security Blocked", {
        description: "You must enter the Master PIN.",
      });
      return;
    }

    setUpdating(true);
    const nextState = !isLocked;
    const toastId = toast.loading("Verifying credentials...");

    const res = await toggleSystemLock(nextState, pin, reason);

    if (res.success) {
      setIsLocked(nextState);
      setPin("");
      toast.success(
        nextState ? "System globally LOCKED." : "System globally UNLOCKED.",
        { id: toastId },
      );
    } else {
      toast.error("Execution Failed", { id: toastId, description: res.error });
    }
    setUpdating(false);
  };

  const handlePinChange = async () => {
    if (!currentPin || !newPin) {
      toast.error("Missing Fields", {
        description: "Please fill out both PIN fields.",
      });
      return;
    }

    setIsChangingPin(true);
    const toastId = toast.loading("Updating security credentials...");

    const res = await updateMasterPin(currentPin, newPin);

    if (res.success) {
      toast.success("Master PIN updated successfully.", { id: toastId });
      setCurrentPin("");
      setNewPin("");
    } else {
      toast.error("Update Failed", { id: toastId, description: res.error });
    }
    setIsChangingPin(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 gap-6">
      {/* KILL SWITCH CARD */}
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white shadow-2xl rounded-2xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-sm uppercase tracking-widest text-rose-500 flex items-center gap-2 font-black">
            <ShieldAlert className="w-5 h-5 animate-pulse" /> Core Kill-Switch
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <p className="text-sm font-bold">ERP Core Status</p>
              <p
                className={`text-xs font-medium ${isLocked ? "text-rose-500 animate-pulse" : "text-emerald-500"}`}
              >
                {isLocked ? "SYSTEM SUSPENDED" : "SYSTEM LIVE & FUNCTIONAL"}
              </p>
            </div>
            <Switch
              checked={isLocked}
              onCheckedChange={handleToggle}
              disabled={updating}
              className="data-[state=checked]:bg-rose-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-rose-500" /> Master Security
              PIN
            </label>
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-center font-mono tracking-widest text-lg focus-visible:ring-rose-500 focus-visible:border-rose-500"
              disabled={updating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" /> Interface Reason
              Notice
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Annual server subscription expired."
              className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-sm"
              disabled={isLocked || updating}
            />
          </div>
        </CardContent>
      </Card>

      {/* SECURITY SETTINGS CARD */}
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white shadow-2xl rounded-2xl">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2 font-bold">
            <LockKeyhole className="w-4 h-4" /> Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Current PIN
              </label>
              <Input
                type="password"
                maxLength={6}
                value={currentPin}
                onChange={(e) =>
                  setCurrentPin(e.target.value.replace(/\D/g, ""))
                }
                placeholder="••••••"
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-center font-mono tracking-widest focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                New PIN
              </label>
              <Input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl text-center font-mono tracking-widest focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <Button
            onClick={handlePinChange}
            disabled={isChangingPin || !currentPin || !newPin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl h-10"
          >
            {isChangingPin ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Update Master PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
