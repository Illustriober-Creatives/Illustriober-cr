"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminProjectsPage() {
  const { fetchWithAuth } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetchWithAuth("/api/admin/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoading(false);
      }
    }
    void loadProjects();
  }, [fetchWithAuth]);

  if (loading) return <div className="p-8">Loading projects...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground hover:opacity-90 transition-opacity"
        >
          Initialize Project
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-glass-border bg-surface/50 p-12 text-center">
            <p className="text-foreground/40">No projects yet. Start by initializing one!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-xl border border-glass-border bg-surface p-6 transition-colors hover:border-accent/20"
            >
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-foreground/40">
                  Client: {project.client.firstName} {project.client.lastName} ({project.client.email})
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {project.status}
                </span>
                <p className="text-xs text-foreground/20">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
