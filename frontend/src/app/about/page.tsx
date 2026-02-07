import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Newspaper, Users, Palette, Truck, Printer, Monitor, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "About the George Herald — your trusted source for local news in the Garden Route.",
};

interface StaffMember {
  name: string;
  role: string;
  email?: string;
}

interface Department {
  name: string;
  icon: React.ReactNode;
  staff: StaffMember[];
}

const departments: Department[] = [
  {
    name: "Administration Department",
    icon: <Users className="h-5 w-5" />,
    staff: [
      { name: "Peter Moolman", role: "Non-Executive Director" },
      { name: "Servaas De Kock", role: "Group CEO", email: "servaas@groupeditors.co.za" },
      { name: "Janien Gericke", role: "Group Admin Manager", email: "janieng@groupeditors.co.za" },
      { name: "Sonja Fry", role: "Debtors Clerk", email: "sonja@groupeditors.co.za" },
      { name: "Teresa Bellingam", role: "Debtors Clerk", email: "teresa@groupeditors.co.za" },
      { name: "Lie Venter", role: "Debtors Clerk", email: "lie@groupeditors.co.za" },
      { name: "Lucinda Eksteen", role: "Debtors Clerk", email: "lucinda@groupeditors.co.za" },
      { name: "Karin de Jager", role: "Admin Clerk", email: "karin@groupeditors.co.za" },
      { name: "Juliana Arends", role: "Cleaner" },
      { name: "Monica Tukushe", role: "General Cleaner" },
      { name: "Natasha Afrika", role: "General Cleaner" },
      { name: "Estelle Olivier", role: "Bookkeeper", email: "estelle@groupeditors.co.za" },
      { name: "Joanita Munro", role: "Distribution Co-ordinator", email: "distribution@groupeditors.co.za" },
      { name: "Leroy Lewis", role: "Admin Clerk", email: "leroy@groupeditors.co.za" },
    ],
  },
  {
    name: "Sales Department",
    icon: <Phone className="h-5 w-5" />,
    staff: [
      { name: "Julinda Aucamp", role: "Group Sales Manager", email: "julinda@groupeditors.co.za" },
      { name: "Vrenika Windwaai", role: "Sales Special Projects Coordinator", email: "vrenika@groupeditors.co.za" },
      { name: "Ilana van der Merwe", role: "Sales Executive", email: "ilana@groupeditors.co.za" },
      { name: "Rozanne Olivier", role: "Sales Manager", email: "rozanne@groupeditors.co.za" },
      { name: "Marilee le Grange", role: "Sales Support Administrator", email: "marilee@groupeditors.co.za" },
      { name: "Glenda Richardson", role: "Sales Executive", email: "glenda@groupeditors.co.za" },
      { name: "Chantel Brummer", role: "Sales Executive", email: "chantel@groupeditors.co.za" },
    ],
  },
  {
    name: "Editorial Department",
    icon: <Newspaper className="h-5 w-5" />,
    staff: [
      { name: "Suzette Herrer", role: "Group Editors Managing Editor", email: "mba@groupeditors.co.za" },
      { name: "Lizette da Silva", role: "Editor", email: "lizette@groupeditors.co.za" },
      { name: "Kristy Kolberg", role: "News Editor", email: "kristy@groupeditors.co.za" },
      { name: "Liryke Ferreira", role: "English Sub Editor", email: "liryke@groupeditors.co.za" },
      { name: "Emsie Martin", role: "Afrikaans Sub Editor", email: "emsie@groupeditors.co.za" },
      { name: "Alida de Beer", role: "Journalist", email: "alida@groupeditors.co.za" },
      { name: "Michelle Pienaar", role: "Journalist", email: "michelle@groupeditors.co.za" },
      { name: "Wahl Lessing", role: "English Sub-Editor", email: "wahl@groupeditors.co.za" },
      { name: "Marguerite van Ginkel", role: "Journalist", email: "marguerite@groupeditors.co.za" },
    ],
  },
  {
    name: "Classified Sales",
    icon: <Phone className="h-5 w-5" />,
    staff: [
      { name: "Lo-An-Nel Breytenbach", role: "Classified Manager", email: "loannel@groupeditors.co.za" },
      { name: "Bongi Make-Grootboom", role: "Classified Sales", email: "bongig@groupeditors.co.za" },
      { name: "Lorraine Verhagen", role: "PA: Group CEO and Telesales Consultant", email: "lverhagen@groupeditors.co.za" },
      { name: "Liandra Clasquin", role: "Classifieds | Special Projects", email: "lia@groupeditors.co.za" },
      { name: "Marinda Williams", role: "Receptionist", email: "marindaw@groupeditors.co.za" },
    ],
  },
  {
    name: "Digital Department",
    icon: <Monitor className="h-5 w-5" />,
    staff: [
      { name: "Ilse Schoonraad", role: "Head of Digital", email: "ilse@groupeditors.co.za" },
      { name: "Dorothy Ings", role: "Digital Content Administrator", email: "dot@groupeditors.co.za" },
      { name: "Esté Smit", role: "Social Media Co-ordinator", email: "este@groupeditors.co.za" },
      { name: "Cameron Squire", role: "Digital Producer", email: "cameron@groupeditors.co.za" },
    ],
  },
  {
    name: "Design Studio",
    icon: <Palette className="h-5 w-5" />,
    staff: [
      { name: "Deon Joubert", role: "Production Manager", email: "deonj@groupeditors.co.za" },
      { name: "Lizaan Burger", role: "Ad Coordinator", email: "grjads@groupeditors.co.za" },
      { name: "Janine de Jager", role: "Admin Coordinator", email: "janinedj@groupeditors.co.za" },
      { name: "Marochel Cronjé", role: "Jnr Studio Administrator", email: "marochel@groupeditors.co.za" },
      { name: "Annalene Lindeque", role: "Graphic Designer | Layout", email: "annalene@groupeditors.co.za" },
      { name: "Periëtte Nel", role: "Graphic Designer | Layout", email: "periette@groupeditors.co.za" },
      { name: "Reggie Booysen", role: "Graphic Designer | Layout", email: "reggieb@groupeditors.co.za" },
      { name: "Portia Williams", role: "Graphic Designer | Layout", email: "portia@groupeditors.co.za" },
      { name: "Lelani Moller", role: "Graphic Designer | Layout", email: "lelani@groupeditors.co.za" },
      { name: "Ashwynne Thorne", role: "Designer | Layout", email: "ashwynne@groupeditors.co.za" },
      { name: "Anna-Mart Ferreira", role: "Designer | Layout", email: "anna@groupeditors.co.za" },
      { name: "Shaye-Lee Agulhas", role: "Graphic Designer", email: "shaye-lee@groupeditors.co.za" },
    ],
  },
  {
    name: "Printing & Production Department",
    icon: <Printer className="h-5 w-5" />,
    staff: [
      { name: "Neels Engelbrecht", role: "Print Shop Manager" },
      { name: "Gershine Alaart", role: "Printer Electrician" },
      { name: "Berrie Barnard", role: "Machine Minder" },
      { name: "Vusi Skandla", role: "Machine Minder" },
      { name: "Cyril Williams", role: "Printers' Assistant" },
      { name: "Johannes Fry", role: "Printers' Assistant" },
      { name: "Salmon Solomons", role: "Printers' Assistant" },
      { name: "Eddie Afrika", role: "Printers' Assistant", email: "maintenance@groupeditors.co.za" },
      { name: "Rudewane Hendricks", role: "Printers' Assistant" },
      { name: "Franco Claassen", role: "Machine Minder", email: "franco@groupeditors.co.za" },
      { name: "Magcinonke Simon", role: "General Worker" },
      { name: "Deacon Kamfer", role: "General Worker" },
      { name: "Shaldon Muller", role: "General Worker" },
      { name: "Dylon Salters", role: "General Worker" },
      { name: "Tshepiso Kooper", role: "IT", email: "kooper@groupeditors.co.za" },
    ],
  },
  {
    name: "Drivers",
    icon: <Truck className="h-5 w-5" />,
    staff: [
      { name: "Etienne Myburgh", role: "Driver" },
      { name: "Johannes Bekeer", role: "Driver" },
    ],
  },
  {
    name: "DTP",
    icon: <Palette className="h-5 w-5" />,
    staff: [
      { name: "Dawid Burger", role: "DTP" },
    ],
  },
];

const sisterPublications = [
  "George Herald (Thursday newspaper)",
  "Knysna-Plett Herald (Thursday newspaper)",
  "Oudtshoorn Courant (Thursday newspaper)",
  "Graaff-Reinet Advertiser (online only)",
  "Suid-Kaap Forum (Friday newspaper)",
  "Mossel Bay Advertiser (Friday newspaper)",
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">About Us</span>
      </div>

      {/* Hero section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-black mb-6">About George Herald</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Your trusted source for local news, sport, and community stories from George and the Garden Route.
        </p>
      </div>

      {/* About content */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="prose-george max-w-none space-y-5 text-foreground/85 text-[1.0625rem] leading-[1.85]">
          <p>
            The George Herald is a weekly bilingual community newspaper distributed in the George area in South Africa.
            It is by far the most widely read community newspaper in the area.
          </p>
          <p>
            <strong>14 500 copies</strong> are printed every week. The George Herald is distributed every <strong>Thursday</strong>.
          </p>
          <p>
            George Herald is part of the <strong>Group Editors</strong> media group, which publishes several other regional
            newspapers across the Southern Cape and Garden Route. The publication proudly carries the &ldquo;FAIR&rdquo; stamp
            from the Press Council of South Africa, demonstrating its commitment to truthful, accurate, and ethical journalism.
          </p>
          <p>
            The newspaper focuses on hyper-local news and stories that matter to residents, including local events, community
            issues, sports, schools, business developments, lifestyle features, municipal updates, and crime reporting. Articles
            are produced in both English and Afrikaans to serve a diverse audience in the region.
          </p>
          <p>
            The newspaper has received national recognition for excellence in community journalism, including awards for best
            sold newspaper, best front page, and strong digital presence.
          </p>
        </div>
      </div>

      {/* Sister publications */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-muted/50 border border-border rounded-xl p-6 lg:p-8">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Group Editors Publications
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            The publishers and printers of the following weekly publications:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sisterPublications.map((pub) => (
              <div key={pub} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{pub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-xl p-5 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm mb-1">Address</p>
              <p className="text-sm text-muted-foreground">122 York Street, George, 6530</p>
            </div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm mb-1">Telephone</p>
              <a href="tel:0448742424" className="text-sm text-primary hover:underline">044 874 2424</a>
            </div>
          </div>
        </div>
      </div>

      {/* Staff directory */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-10">Our Team</h2>

        <div className="space-y-10">
          {departments.map((dept) => (
            <section key={dept.name}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-primary/20">
                <span className="text-primary">{dept.icon}</span>
                <h3 className="text-xl font-bold">{dept.name}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{dept.staff.length} member{dept.staff.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {dept.staff.map((person) => (
                  <div
                    key={person.name}
                    className="bg-white border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {person.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{person.role}</p>
                      </div>
                    </div>
                    {person.email && (
                      <a
                        href={`mailto:${person.email}`}
                        className="flex items-center gap-1.5 mt-2.5 text-xs text-primary hover:underline truncate"
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        {person.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
