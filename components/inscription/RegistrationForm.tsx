"use client";

import { useState } from "react";
import type { FormState, SubmitStatus } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import Button from "@/components/ui/Button";

const initialForm: FormState = {
  firstName: "", lastName: "", phone: "", email: "",
  city: "", ageRange: "", mode: "presentiel", message: "", consent: false,
};

const ageRanges = [
  { value: "15 – 20 ans", labelFr: "15 – 20 ans", labelAr: "15 – 20 سنة" },
  { value: "21 – 25 ans", labelFr: "21 – 25 ans", labelAr: "21 – 25 سنة" },
  { value: "26 – 30 ans", labelFr: "26 – 30 ans", labelAr: "26 – 30 سنة" },
];

function validate(form: FormState, dict: Dictionary["inscription"]["form"]): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.firstName.trim()) errors.firstName = dict.requiredField;
  if (!form.lastName.trim()) errors.lastName = dict.requiredField;
  if (!form.phone.trim()) errors.phone = dict.requiredField;
  else if (!/^\+?[\d\s\-]{7,20}$/.test(form.phone)) errors.phone = dict.invalidFormat;
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = dict.invalidFormat;
  if (!form.ageRange) errors.ageRange = dict.requiredField;
  if (!form.consent) errors.consent = dict.mustAccept;
  return errors;
}

const fieldClass = "w-full bg-[#fbf9f3] dark:bg-[#20261b] border border-[#d8d0bf] dark:border-[#454c3c] rounded-[9px] px-4 py-3 font-[var(--font-hanken)] text-[14px] text-[#232a20] dark:text-[#f2ede0] placeholder:text-[#9a9483] dark:placeholder:text-[#8f8973] focus:outline-none focus:border-[#3c4a37] focus:ring-1 focus:ring-[#3c4a37] transition-colors";
const labelClass = "block font-[var(--font-hanken)] text-[13px] font-semibold text-[#3f463a] dark:text-[#d8d4c4] mb-1.5";
const errorClass = "font-[var(--font-hanken)] text-[11.5px] text-[#8a2f29] dark:text-[#e08b81] mt-1";

export default function RegistrationForm({ dict, lang }: { dict: Dictionary["inscription"]["form"]; lang: Locale }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form, dict);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("loading");
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error) {
          setErrors({ firstName: data.error });
        }
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-[#efe9dc] dark:bg-[#242b1e] rounded-[13px] p-8 md:p-10 flex flex-col items-center justify-center min-h-[500px] text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#3c4a37] flex items-center justify-center shrink-0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cda350" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[22px] mb-2">بَارَكَ اللَّهُ فِيكِ</p>
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[30px] text-[#232a20] dark:text-[#f2ede0] mb-2">
            {dict.success.title}
          </h2>
          <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] dark:text-[#b7b2a0] max-w-[360px] leading-relaxed">
            {dict.success.message}
          </p>
        </div>
        <div className="w-full max-w-[360px] bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[10px] p-4 text-left space-y-2">
          <p className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] dark:text-[#8f8973] uppercase tracking-wider">{dict.success.recap}</p>
          <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] dark:text-[#f2ede0] font-semibold">{form.firstName} {form.lastName}</p>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#b7b2a0]">{form.phone}{form.city ? ` · ${form.city}` : ""}</p>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#b7b2a0]">
            {form.mode === "presentiel" ? dict.onsiteMode : dict.onlineMode} · {form.ageRange}
          </p>
        </div>
        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973]">
          {dict.success.checkMessages}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#efe9dc] dark:bg-[#242b1e] rounded-[13px] p-6 md:p-8">
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0] mb-1">
        {dict.title}
      </h2>
      <p className="font-[var(--font-hanken)] text-[14px] text-[#6f7363] dark:text-[#b7b2a0] mb-7 leading-relaxed">
        {dict.subtitle}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Prénom + Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>
              {dict.firstName} <span className="text-[#8a2f29] dark:text-[#e08b81]">*</span>
            </label>
            <input
              type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
              placeholder={dict.firstNamePlaceholder} className={fieldClass} autoComplete="given-name"
            />
            {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
          </div>
          <div>
            <label className={labelClass}>
              {dict.lastName} <span className="text-[#8a2f29] dark:text-[#e08b81]">*</span>
            </label>
            <input
              type="text" value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
              placeholder={dict.lastNamePlaceholder} className={fieldClass} autoComplete="family-name"
            />
            {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
          </div>
        </div>

        {/* Téléphone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>
              {dict.phone} <span className="text-[#8a2f29] dark:text-[#e08b81]">*</span>
            </label>
            <input
              type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              placeholder={dict.phonePlaceholder} className={fieldClass} autoComplete="tel" dir="ltr"
            />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>{dict.email}</label>
            <input
              type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder={dict.emailPlaceholder} className={fieldClass} autoComplete="email" dir="ltr"
            />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
        </div>

        {/* Ville + Tranche d'âge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>{dict.city}</label>
            <input
              type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
              placeholder={dict.cityPlaceholder} className={fieldClass} autoComplete="address-level2"
            />
          </div>
          <div>
            <label className={labelClass}>
              {dict.ageRange} <span className="text-[#8a2f29] dark:text-[#e08b81]">*</span>
            </label>
            <select
              value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer`}
            >
              <option value="">{dict.ageRangePlaceholder}</option>
              {ageRanges.map((a) => (
                <option key={a.value} value={a.value}>{lang === "ar" ? a.labelAr : a.labelFr}</option>
              ))}
            </select>
            {errors.ageRange && <p className={errorClass}>{errors.ageRange}</p>}
          </div>
        </div>

        {/* Mode de participation */}
        <div className="mb-4">
          <label className={labelClass}>
            {dict.mode} <span className="text-[#8a2f29] dark:text-[#e08b81]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["presentiel", "ligne"] as const).map((m) => {
              const active = form.mode === m;
              return (
                <button
                  key={m} type="button" onClick={() => set("mode", m)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-[9px] border-2 transition-colors text-left ${
                    active
                      ? "border-[#3c4a37] bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)]"
                      : "border-[#d8d0bf] dark:border-[#454c3c] bg-[#fbf9f3] dark:bg-[#20261b] hover:border-[#9a9483]"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-[#3c4a37]" : "border-[#d8d0bf] dark:border-[#454c3c]"}`}>
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-[#3c4a37]" />}
                  </span>
                  <span className="font-[var(--font-hanken)] font-semibold text-[14px] text-[#3f463a] dark:text-[#d8d4c4]">
                    {m === "presentiel" ? dict.onsiteMode : dict.onlineMode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div className="mb-5">
          <label className={labelClass}>{dict.message}</label>
          <textarea
            value={form.message} onChange={(e) => set("message", e.target.value)}
            placeholder={dict.messagePlaceholder}
            rows={3} className={`${fieldClass} resize-none`}
          />
        </div>

        {/* Consentement */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <span
            className={`mt-0.5 w-5 h-5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
              form.consent ? "border-[#3c4a37] bg-[#3c4a37]" : "border-[#d8d0bf] dark:border-[#454c3c] group-hover:border-[#3c4a37]"
            }`}
          >
            {form.consent && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1" stroke="#fbf9f3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <input
            type="checkbox" className="sr-only"
            checked={form.consent} onChange={(e) => set("consent", e.target.checked)}
          />
          <span className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
            {dict.consent}
          </span>
        </label>
        {errors.consent && <p className={`${errorClass} -mt-4 mb-4`}>{errors.consent}</p>}

        {/* Submit */}
        <Button type="submit" fullWidth size="lg" disabled={status === "loading"}>
          {status === "loading" ? dict.submitting : dict.submit}
        </Button>

        {status === "error" && (
          <p className="mt-3 text-center font-[var(--font-hanken)] text-[13px] text-[#8a2f29] dark:text-[#e08b81]">
            {dict.errorGeneric}
          </p>
        )}

        <p className="mt-3 text-center font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973]">
          {dict.privacyNote}
        </p>
      </form>
    </div>
  );
}
