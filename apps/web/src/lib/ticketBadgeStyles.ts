export function ticketStatusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    case "IN_REVIEW":
      return "bg-purple-500/10 text-purple-700 border-purple-500/20";
    case "IN_PROGRESS":
      return "bg-orange-500/10 text-orange-700 border-orange-500/20";
    case "RESOLVED":
      return "bg-green-500/10 text-green-700 border-green-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
  }
}

export function ticketTypeBadgeClass(type: string): string {
  switch (type) {
    case "BUG":
      return "bg-red-500/10 text-red-700";
    case "FEATURE":
      return "bg-purple-500/10 text-purple-700";
    case "IDEA":
      return "bg-yellow-500/10 text-yellow-700";
    case "QUESTION":
      return "bg-sky-500/10 text-sky-700";
    default:
      return "bg-zinc-500/10 text-zinc-600";
  }
}

export function ticketPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-700";
    case "HIGH":
      return "bg-orange-500/10 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-700";
    case "LOW":
      return "bg-blue-500/10 text-blue-700";
    default:
      return "bg-zinc-500/10 text-zinc-600";
  }
}
