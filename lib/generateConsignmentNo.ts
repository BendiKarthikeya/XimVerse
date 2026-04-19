export function generateConsignmentNo(existingCount: number): string {
  const year = new Date().getFullYear()
  const seq = String(existingCount + 1).padStart(3, '0')
  return `XIM-${year}-${seq}`
}
