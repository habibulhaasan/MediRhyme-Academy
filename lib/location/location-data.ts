// Bangladesh geography helpers, adapted from
// https://github.com/habibulhaasan/Location-JSON (Division -> District ->
// Upazila hierarchy, bd-data.json). Only the geography helpers are kept
// here (the source repo's hospital dataset/helpers aren't needed for this
// project).

import bdDataJson from "./bd-data.json";

export type Upazila = { id: string; name: string; nameBn: string };

export type District = {
  id: string; name: string; nameBn: string; divisionId: string;
  lat: string; long: string; upazilas: Upazila[];
};

export type Division = {
  id: string; name: string; nameBn: string; lat: string; long: string; districts: District[];
};

export const BD_DIVISIONS: Division[] = bdDataJson as Division[];

export function getAllDistricts(): District[] {
  return BD_DIVISIONS.flatMap((div) => div.districts);
}

export function getDistrictsByDivision(divisionId: string): District[] {
  return BD_DIVISIONS.find((d) => d.id === divisionId)?.districts ?? [];
}

export function getUpazilasByDistrict(districtId: string): Upazila[] {
  return getAllDistricts().find((d) => d.id === districtId)?.upazilas ?? [];
}

export function getDivisionById(id: string): Division | undefined {
  return BD_DIVISIONS.find((d) => d.id === id);
}

export function getDistrictById(id: string): District | undefined {
  return getAllDistricts().find((d) => d.id === id);
}

export function getUpazilaById(id: string): Upazila | undefined {
  return getAllDistricts().flatMap((d) => d.upazilas).find((u) => u.id === id);
}

/** Build a plain, storable address object + a human-readable Bangla/English label. */
export function resolveAddress(
  divisionId: string | null,
  districtId: string | null,
  upazilaId: string | null,
  locale: "en" | "bn" = "bn"
): { divisionId: string | null; districtId: string | null; upazilaId: string | null; label: string } {
  const division = divisionId ? getDivisionById(divisionId) : undefined;
  const district = districtId ? getDistrictById(districtId) : undefined;
  const upazila = upazilaId ? getUpazilaById(upazilaId) : undefined;

  const parts =
    locale === "bn"
      ? [upazila?.nameBn, district?.nameBn, division?.nameBn]
      : [upazila?.name, district?.name, division ? `${division.name} Division` : undefined];

  return { divisionId, districtId, upazilaId, label: parts.filter(Boolean).join(", ") };
}
