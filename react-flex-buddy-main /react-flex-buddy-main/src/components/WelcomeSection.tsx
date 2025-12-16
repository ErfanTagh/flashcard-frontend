interface WelcomeSectionProps {
  user?: {
    given_name?: string;
    name?: string;
  };
}

export const WelcomeSection = ({ user }: WelcomeSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
      <div className="container py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome{user?.given_name ? ` ${user.given_name}` : ''}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to review your flashcards and learn something new?
          </p>
        </div>
      </div>
    </div>
  );
};