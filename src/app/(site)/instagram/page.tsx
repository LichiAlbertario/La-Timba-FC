import { getInstagramPosts } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { InstagramEmbeds } from "@/components/site/InstagramEmbeds";
import { cardClass } from "@/lib/site-ui";

export const metadata = { title: "Instagram · La Timba FC" };

export default async function InstagramPage() {
  const posts = await getInstagramPosts();

  return (
    <div>
      <PageHeader eyebrow="Redes" title="Instagram" />

      {posts.length > 0 ? (
        <InstagramEmbeds posts={posts} />
      ) : (
        <div className={cardClass}>
          <p className="text-sm text-black/50">Todavía no hay posts cargados.</p>
        </div>
      )}
    </div>
  );
}
