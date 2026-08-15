"use client";
import { GOVT_IHT_LIST, NON_GOVT_IHT_VALUE } from "@/lib/ihtList";

interface IhtSelectProps {
  selected: string;
  manualName: string;
  onSelectedChange: (value: string) => void;
  onManualNameChange: (value: string) => void;
  required?: boolean;
}

const cls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40 bg-white";

export default function IhtSelect({ selected, manualName, onSelectedChange, onManualNameChange, required }: IhtSelectProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">আই.এইচ.টির নাম</label>
      <select required={required} value={selected} onChange={(e) => onSelectedChange(e.target.value)} className={cls}>
        <option value="">আই.এইচ.টি নির্বাচন করুন</option>
        {GOVT_IHT_LIST.map((name) => <option key={name} value={name}>{name}</option>)}
        <option value={NON_GOVT_IHT_VALUE}>বেসরকারি / অন্যান্য (নিজে লিখুন)</option>
      </select>

      {selected === NON_GOVT_IHT_VALUE && (
        <input
          required={required}
          type="text"
          placeholder="আপনার ইনস্টিটিউটের নাম লিখুন"
          value={manualName}
          onChange={(e) => onManualNameChange(e.target.value)}
          className={`${cls} mt-2`}
        />
      )}
    </div>
  );
}
