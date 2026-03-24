import { motion } from "framer-motion";
import { Check, Zap, Star, Shield, PlayCircle } from "lucide-react";
import Header from "../components/Navigations/header";
import Footer from "../components/Navigations/footer";
import styles from "./UpgradePage.module.css";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Experience VibeBox with essentials",
    features: [
      "Standard quality streaming (up to 720p)",
      "Access to full library",
      "Limited ad content",
      "Watch on 1 device"
    ],
    cta: "Current Plan",
    active: true,
    premium: false
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    description: "The ultimate ad-free experience",
    features: [
      "Ultra HD & 4K streaming",
      "Zero ads — pure immersion",
      "Download for offline watching",
      "Watch on 4 devices simultaneously",
      "Priority customer support"
    ],
    cta: "Upgrade to Pro",
    active: false,
    premium: true,
    tag: "MOST POPULAR"
  }
];

export default function UpgradePage() {
  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.main}>
        <motion.div 
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.title}>Elevate Your <span className={styles.gradient}>Vibe</span></h1>
          <p className={styles.subtitle}>Choose the plan that fits your lifestyle. Switch or cancel anytime.</p>
        </motion.div>

        <div className={styles.plansGrid}>
          {PLANS.map((plan, index) => (
            <motion.div 
              key={plan.id}
              className={`${styles.planCard} ${plan.premium ? styles.premium : ""}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              {plan.tag && <div className={styles.planTag}>{plan.tag}</div>}
              
              <div className={styles.planHeader}>
                <div className={styles.planIcon}>
                  {plan.premium ? <Zap size={32} /> : <PlayCircle size={32} />}
                </div>
                <h2 className={styles.planName}>{plan.name}</h2>
                <div className={styles.planPrice}>
                  <span className={styles.amount}>{plan.price}</span>
                  {plan.period && <span className={styles.period}>{plan.period}</span>}
                </div>
                <p className={styles.planDesc}>{plan.description}</p>
              </div>

              <div className={styles.featuresList}>
                {plan.features.map((feature, i) => (
                  <div key={i} className={styles.featureItem}>
                    <Check size={18} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`${styles.ctaButton} ${plan.premium ? styles.premiumCta : ""}`}
                disabled={plan.active}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <section className={styles.benefits}>
          <div className={styles.benefitItem}>
            <Shield size={24} />
            <h3>Secure Payment</h3>
            <p>Your data is protected with industry-standard encryption.</p>
          </div>
          <div className={styles.benefitItem}>
            <Star size={24} />
            <h3>Premium Content</h3>
            <p>Early access to originals and exclusive 4K content.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
