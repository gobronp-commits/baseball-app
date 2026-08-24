import { getNotableProspects, getNotableEvents } from "@/lib/games";
import NotableProspects from "@/components/NotableProspects";
import NotableEventsList from "@/components/NotableEventsList";

export default function NotableSightingsPage() {
  const prospects = getNotableProspects();
  const events = getNotableEvents();

  return (
    <div>
      <h1 className="font-heading text-3xl uppercase tracking-wide mb-1">
        Notable Sightings
      </h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-8">
        Future big leaguers seen before they made it, plus ejections, milestones, and other
        moments worth remembering.
      </p>

      <div className="mb-12">
        <NotableProspects prospects={prospects} />
      </div>

      <NotableEventsList events={events} />
    </div>
  );
}
