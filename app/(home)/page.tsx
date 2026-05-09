import LoginButton from "@/app/(components-navbar)/login-button";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/server-utils";
import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.heroTag}>
          Harvard Computing Society: Tech for Social Good
        </span>

        <h1 className={styles.heroTitle}>
          Feeling socially good? Welcome to the Social Good Marketplace!
        </h1>

        <p className={styles.heroSubtitle}>
          T4SG Social Good Marketplace bridges the gap between skilled students
          and nonprofits with real tech project needs — from building dashboards
          to data pipelines.
        </p>

        {user ? (
          <Button asChild size="lg" className={styles.heroCta}>
            <Link href="/dashboard">Browse Opportunities →</Link>
          </Button>
        ) : (
          <LoginButton />
        )}
      </section>

      {/* ── How it works ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSubtitle}>
            Three steps to make an impact.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {[
            {
              step: "01",
              title: "Sign in with GitHub",
              description:
                "Create an account instantly using your existing GitHub profile. No extra setup required.",
            },
            {
              step: "02",
              title: "Browse opportunities",
              description:
                "Explore nonprofit projects alongside the skills they need — React, Python, data analysis, and more.",
            },
            {
              step: "03",
              title: "Express interest",
              description:
                'Click "I\'m interested" on any project card and the nonprofit will be notified to reach out.',
            },
          ].map(({ step, title, description }) => (
            <div key={step} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step}</span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why section ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Social Good Marketplace?</h2>
          <p className={styles.sectionSubtitle}>
            Built for impact, designed for simplicity.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {[
            {
              title: "Real projects, real impact",
              description:
                "Every listing comes from a nonprofit with a genuine technical need. Your work goes directly toward social good.",
            },
            {
              title: "Description Transparency",
              description:
                "Each opportunity surfaces the exact skills required so you can find projects where you can contribute most.",
            },
            {
              title: "Explore",
              description:
                "Sign in, explore all open opportunities, and only reach out when you find a project that resonates with you! We will add more projects via outreaching.",
            },
            {
              title: "Open source",
              description:
                "Built by HCS Tech for Social Good in 2025-2026! Inspired by our projects each semester, we see that there is a need for open-source support. ",
            },
          ].map(({ title, description }) => (
            <div key={title} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {!user && (
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to get started?</h2>
          <p className={styles.ctaSubtitle}>
            Sign in with GitHub to browse open opportunities and connect with
            nonprofits looking for your skills.
          </p>
          <LoginButton />
        </section>
      )}
    </main>
  );
}
