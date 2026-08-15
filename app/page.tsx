import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CourseTimeline from "@/components/CourseTimeline";
import FeesCards from "@/components/FeesCards";
import RegistrationForm from "@/components/RegistrationForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <CourseTimeline />
      <FeesCards />
      <RegistrationForm />
      <Footer />
    </>
  );
}
