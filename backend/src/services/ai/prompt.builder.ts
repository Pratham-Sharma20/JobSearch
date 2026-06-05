export function buildClassificationPrompt(title: string, description: string): string {
  return `You are an expert job classifier.

Classify the following job:

Title:
${title}

Description:
${description}

Return JSON:
{
  "classification": "...",
  "confidence": 0.0-1.0,
  "reason": "short explanation"
}

Rules:
- internship → student roles
- new_grad → fresh graduates
- entry_level → 0-1 year
- co_op → co-op programs
- rotational → rotation programs
- experienced → 2+ years roles

Be strict. If unsure, classify as experienced.`;
}
