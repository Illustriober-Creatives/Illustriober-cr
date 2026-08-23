export function ticketStatusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "IN_REVIEW":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "IN_PROGRESS":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "RESOLVED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export function ticketTypeBadgeClass(type: string): string {
  switch (type) {
    case "BUG":
      return "bg-red-500/10 text-red-400";
    case "FEATURE":
      return "bg-purple-500/10 text-purple-400";
    case "IDEA":
      return "bg-yellow-500/10 text-yellow-400";
    case "QUESTION":
      return "bg-sky-500/10 text-sky-400";
    default:
      return "bg-zinc-500/10 text-zinc-400";
  }
}

export function ticketPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-400";
    case "HIGH":
      return "bg-orange-500/10 text-orange-400";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400";
    default:
      return "bg-blue-500/10 text-blue-400";
  }
}
