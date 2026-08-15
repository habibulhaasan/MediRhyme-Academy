"use client";
import { useMemo } from "react";
import { BD_DIVISIONS, getDistrictsByDivision, getUpazilasByDistrict } from "@/lib/location/location-data";

export interface LocationValue {
  divisionId: string;
  districtId: string;
  upazilaId: string;
  addressDetail: string;
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  required?: boolean;
}

const selectCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy/40 bg-white";

export default function LocationSelect({ value, onChange, required }: LocationSelectProps) {
  const districts = useMemo(() => (value.divisionId ? getDistrictsByDivision(value.divisionId) : []), [value.divisionId]);
  const upazilas = useMemo(() => (value.districtId ? getUpazilasByDistrict(value.districtId) : []), [value.districtId]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">বিভাগ (ঠিকানা)</label>
          <select
            required={required}
            value={value.divisionId}
            onChange={(e) => onChange({ divisionId: e.target.value, districtId: "", upazilaId: "", addressDetail: value.addressDetail })}
            className={selectCls}
          >
            <option value="">বিভাগ নির্বাচন করুন</option>
            {BD_DIVISIONS.map((d) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-1">জেলা</label>
          <select
            required={required}
            value={value.districtId}
            disabled={!value.divisionId}
            onChange={(e) => onChange({ ...value, districtId: e.target.value, upazilaId: "" })}
            className={`${selectCls} disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">জেলা নির্বাচন করুন</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-1">উপজেলা</label>
          <select
            required={required}
            value={value.upazilaId}
            disabled={!value.districtId}
            onChange={(e) => onChange({ ...value, upazilaId: e.target.value })}
            className={`${selectCls} disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">উপজেলা নির্বাচন করুন</option>
            {upazilas.map((u) => <option key={u.id} value={u.id}>{u.nameBn}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">বিস্তারিত ঠিকানা</label>
        <textarea
          required={required}
          rows={2}
          placeholder="বাসা/হোল্ডিং নং, রোড, গ্রাম/মহল্লা ইত্যাদি"
          value={value.addressDetail}
          onChange={(e) => onChange({ ...value, addressDetail: e.target.value })}
          className={selectCls}
        />
      </div>
    </div>
  );
}
