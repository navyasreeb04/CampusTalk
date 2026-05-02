export const normalizeSkill = (skill = "") => skill.toLowerCase().trim().replace(/\s+/g, " ");

export const formatSkillLabel = (skill = "") => {
  const normalizedSkill = normalizeSkill(skill);

  if (!normalizedSkill) {
    return "";
  }

  return normalizedSkill
    .split(" ")
    .map((word) =>
      word.length <= 4 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};
