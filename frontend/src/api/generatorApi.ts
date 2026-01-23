export type LastMatch = {
    date: string;
    opponent: string;
    venue: "Home" | "Away" | string;
    goalsScored: number;
    goalsConceded: number;
    xG: number;
    xGConceded: number;
};

export type TeamStatsResponse = {
    teamName: string;
    last5Matches: LastMatch[];
};

export async function fetchTeamStats(teamName: string): Promise<TeamStatsResponse> {
    const safe = encodeURIComponent(teamName.trim());

    const res = await fetch(`http://localhost:9000/api/v1/generator/stats/${safe}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Stats error ${res.status}: ${text || res.statusText}`);
    }

    return res.json() as Promise<TeamStatsResponse>;
}
