export interface DomainOption {
  id: string;
  name: string;
  skills: string[];
}

export const loadDomains = (): DomainOption[] => {
  // Use raw import to prevent Vite from using its JSON plugin, which crashes on empty files
  const modules = import.meta.glob('./*.json', { eager: true, query: '?raw', import: 'default' });

  const domains: DomainOption[] = [];

  for (const path in modules) {
    const rawText = modules[path] as string;

    let data;
    try {
      if (!rawText || rawText.trim() === '') continue;
      data = JSON.parse(rawText);
    } catch (e) {
      console.warn(`[Domains] Skipping ${path} because it is currently empty or invalid JSON.`);
      continue; // Skip safely without crashing the app!
    }

    // Generate a secure ID from the filename (e.g., './backend.json' -> 'backend')
    const fileNameMatch = path.match(/\/?([^/]+)\.json$/);
    const domainId = fileNameMatch ? fileNameMatch[1] : `domain_${Math.random()}`;

    const skills: string[] = [];

    // Parse the skills structure as defined by the roadmaps
    if (data && data.main_branches) {
      data.main_branches.forEach((branch: any) => {
        if (branch && branch.name) {
          skills.push(branch.name);
        }
      });
    }

    domains.push({
      id: domainId,
      name: data.title || domainId.replace(/_/g, ' '),
      skills: skills
    });
  }

  return domains;
};
