import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Zap,
    BrainCircuit,
    GraduationCap,
    Trophy,
    CalendarDays,
    PlusCircle,
    CheckCircle,
    Sparkles,
    Book,
    MessageSquare,
    Users,
    Edit,
    Check,
    X,
    AlertTriangle,
    Clock,
    Award
} from 'lucide-react';

// ===============================
// Types & Interfaces
// ===============================

interface LogEntry {
    label: string;
    amount: number;
    timestamp: Date;
}

// ===============================
// Constants
// ===============================

const XP_PER_LEVEL = 700;
const DAILY_CHALLENGE_XP = 25;
const SIDE_QUEST_XP = 15;
const REWARD_INTERVAL = 100;

const TASK_CATEGORIES = {
    Initiation: [
        { label: "Read 1–4 pages", value: 5, icon: BookOpen },
    ],
    Engagement: [
        { label: "Read 5–14 pages", value: 10, icon: Book },
        { label: "Read 15–24 pages", value: 15, icon: Book },
        { label: "Read 25+ pages", value: 20, icon: Book },
    ],
    Understanding: [
        { label: "Understanding it", value: 10, icon: BrainCircuit },
        { label: "Active recall", value: 5, icon: BrainCircuit },
        { label: "Linking to real world", value: 10, icon: BrainCircuit },
        { label: "Answering/discussing", value: 5, icon: MessageSquare },
    ],
    Mastery: [
        { label: "Reading notes later", value: 10, icon: GraduationCap },
        { label: "Teaching someone", value: 20, icon: Users },
    ],
};

const MOOD_OPTIONS = [
    { value: 'Happy', label: 'Happy', icon: '😊', xp: 10 },
    { value: 'Motivated', label: 'Motivated', icon: '🚀', xp: 10 },
    { value: 'Focused', label: 'Focused', icon: '🎯', xp: 5 },
    { value: 'Calm', label: 'Calm', icon: '😌', xp: 0 },
    { value: 'Tired', label: 'Tired', icon: '😴', xp: 0 },
    { value: 'Stressed', label: 'Stressed', icon: '😓', xp: 0 },
];

// Animation variants
const rewardAnimationVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1.2,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.5,
        },
    },
    exit: { opacity: 0, scale: 0.5 },
};

const xpAnimationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// ===============================
// Helper Functions
// ===============================
const getRandomDailyChallenge = () => {
    const challenges = [
        "Read 10 pages today",
        "Reflect on your progress for 10 minutes",
        "Take notes on your learning",
        "Try a new study technique",
        "Solve 5 practice problems",
        "Summarize a chapter",
        "Create a study plan for the week",
        "Review previous material",
        "Attend a study group",
        "Explain a concept to someone else"
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
};

// ===============================
// Components
// ===============================

const XpDisplay = ({ xp }: { xp: number }) => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

    return (
        <Card className="bg-gradient-to-br from-purple-800 to-indigo-800 text-white shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Your Progress
                </CardTitle>
                <CardDescription>Level: {level}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Progress
                        value={progress}
                        className="h-4 bg-gray-700"
                        style={{
                            '--progress-color': `linear-gradient(to right, #4ade80, #22c55e)`
                        }}
                    />
                    <p className="text-sm text-gray-200 text-center">{Math.floor(progress)}% to next level</p>
                    <p className="text-xs text-gray-300 text-center">
                        {xp} / {level * XP_PER_LEVEL} XP
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

const TaskButton = ({
    label,
    value,
    onClick,
    icon: Icon
}: {
    label: string;
    value: number;
    onClick: (amount: number, label: string) => void;
    icon: React.ComponentType<{ className?: string }>;
}) => (
    <Button
        onClick={() => onClick(value, label)}
        className={cn(
            "w-full flex items-center justify-start gap-3",
            "bg-gradient-to-r from-blue-600 to-blue-800",
            "text-white font-semibold rounded-xl shadow-lg",
            "hover:from-blue-500 hover:to-blue-700 hover:scale-105",
            "transition-all duration-300",
            "border-none",
            "py-4 px-6",
            "shadow-blue-500/50"
        )}
    >
        <Icon className="w-5 h-5" />
        +{value} XP - {label}
    </Button>
);

const RewardAnimation = () => (
    <motion.div
        variants={rewardAnimationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    >
        <Card className="bg-yellow-400 text-black p-6 rounded-3xl shadow-2xl border-4 border-black">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8" />
                    Reward Time!
                    <Sparkles className="w-8 h-8" />
                </CardTitle>
                <CardDescription className="text-center text-lg">
                    You earned 100 XP! Treat yourself!
                </CardDescription>
            </CardHeader>
        </Card>
    </motion.div>
);

const DailyChallengeCard = ({
    challenge,
    onComplete,
    completed
}: {
    challenge: string;
    onComplete: () => void;
    completed: boolean;
}) => (
    <Card
        className={cn(
            "bg-gradient-to-br from-green-700 to-emerald-700 text-white shadow-lg border-none",
            "transition-all duration-300",
            completed ? "opacity-70" : "hover:scale-[1.02] hover:shadow-xl"
        )}
    >
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <CalendarDays className="w-5 h-5 text-yellow-400" />
                Daily Challenge
            </CardTitle>
            <CardDescription>Complete for {DAILY_CHALLENGE_XP} XP</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <p className="text-lg">{challenge}</p>
                {!completed && (
                    <Button
                        onClick={onComplete}
                        className="w-full bg-yellow-500 text-black font-bold
                                   hover:bg-yellow-400 transition-colors"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete Challenge
                    </Button>
                )}
                {completed && (
                    <div className="flex items-center gap-2 text-green-200">
                        <CheckCircle className="w-5 h-5" />
                        Challenge Completed!
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);

const StreakBonusCard = ({ streak, onClaim, bonus }: { streak: number; onClaim: () => void; bonus: number }) => {
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        if (bonus === 0) {
            setClaimed(true);
        }
    }, [bonus]);

    return (
        <Card className={cn(
            "bg-gradient-to-br from-pink-700 to-rose-700 text-white shadow-lg border-none",
            "transition-all duration-300"
        )}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Streak Bonus
                </CardTitle>
                <CardDescription>Current Streak: {streak} days</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {bonus > 0 && !claimed ? (
                        <Button
                            onClick={() => {
                                onClaim();
                                setClaimed(true);
                            }}
                            className="w-full bg-yellow-500 text-black font-bold
                                     hover:bg-yellow-400 transition-colors"
                        >
                            Claim {bonus} XP Bonus!
                        </Button>
                    ) : (
                        <p className="text-lg text-gray-200">
                            {bonus > 0
                                ? "Streak bonus claimed!"
                                : "Keep studying to build your streak!"
                            }
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const SideQuestCard = ({ onComplete }: { onComplete: (quest: string) => void }) => {
    const [quest, setQuest] = useState('');
    const [completed, setCompleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleComplete = () => {
        if (quest.trim()) {
            onComplete(quest);
            setCompleted(true);
            setIsEditing(false); // Exit edit mode after completion
        } else {
            alert("Please enter a side quest!"); // Basic validation
        }
    };

    return (
        <Card className="bg-gradient-to-br from-amber-700 to-orange-700 text-white shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <PlusCircle className="w-5 h-5 text-yellow-400" />
                    Side Quest
                </CardTitle>
                <CardDescription>Earn {SIDE_QUEST_XP} XP</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isEditing ? (
                        <>
                            <Textarea
                                value={quest}
                                onChange={(e) => setQuest(e.target.value)}
                                placeholder="Describe your side quest..."
                                className="bg-black/20 text-white border-yellow-400/50"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleComplete}
                                    className="bg-green-500 text-white font-bold hover:bg-green-400 flex items-center gap-1"
                                >
                                    <Check className="w-4 h-4" />
                                    Complete
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setQuest(''); // Clear input
                                    }}
                                    className="bg-red-500 text-white font-bold hover:bg-red-400 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {!completed ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-yellow-500 text-black font-bold
                                             hover:bg-yellow-400 transition-colors flex items-center gap-2"
                                >
                                    <Edit className="w-5 h-5" />
                                    Add Side Quest
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-green-200">
                                    <CheckCircle className="w-5 h-5" />
                                    Quest Completed: {quest}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const MoodTrackerCard = ({ onMoodSelect, onSubmit, selectedMood }: {
    onMoodSelect: (mood: string) => void;
    onSubmit: () => void;
    selectedMood: string;
}) => {
    return (
        <Card className="bg-gradient-to-br from-indigo-700 to-violet-700 text-white shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <BrainCircuit className="w-5 h-5 text-yellow-400" />
                    Track Your Mood
                </CardTitle>
                <CardDescription>Select your study mood</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {MOOD_OPTIONS.map((moodOption) => (
                            <Button
                                key={moodOption.value}
                                onClick={() => onMoodSelect(moodOption.value)}
                                className={cn(
                                    "px-4 py-2 rounded-full",
                                    "transition-all duration-300",
                                    "text-sm",
                                    selectedMood === moodOption.value
                                        ? "bg-yellow-500 text-black font-bold shadow-lg"
                                        : "bg-black/20 text-white hover:bg-black/40"
                                )}
                            >
                                {moodOption.icon} {moodOption.label}
                            </Button>
                        ))}
                    </div>
                    <Button
                        onClick={onSubmit}
                        className="w-full bg-yellow-500 text-black font-bold
                                   hover:bg-yellow-400 transition-colors"
                        disabled={!selectedMood}
                    >
                        Submit Mood
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const TimeTrackerCard = ({ onStart, onComplete, isTracking }: {
    onStart: () => void;
    onComplete: () => void;
    isTracking: boolean;
}) => {
    return (
        <Card className="bg-gradient-to-br from-cyan-700 to-blue-700 text-white shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Time Tracker
                </CardTitle>
                <CardDescription>Track your focused study time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isTracking ? (
                        <Button
                            onClick={onComplete}
                            className="w-full bg-red-500 text-white font-bold
                                     hover:bg-red-400 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Complete Task
                        </Button>
                    ) : (
                        <Button
                            onClick={onStart}
                            className="w-full bg-yellow-500 text-black font-bold
                                     hover:bg-yellow-400 transition-colors"
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Start Task
                        </Button>
                    )}
                    {isTracking && (
                        <p className="text-sm text-yellow-100 animate-pulse flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Tracking time... (Max 30 mins for bonus)
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const BadgeCard = ({ badges }: { badges: string[] }) => {
    const badgeDetails = {
        "Page Turner": { label: "Page Turner", description: "Earned 100 XP", icon: <BookOpen className="w-6 h-6 text-blue-400" /> },
        "Side Quest Hero": { label: "Side Quest Hero", description: "Completed 50 Side Quests", icon: <PlusCircle className="w-6 h-6 text-green-400" /> },
        "Streak Master": { label: "Streak Master", description: "Maintained a 7-day streak", icon: <CalendarDays className="w-6 h-6 text-pink-400" /> },
        "Time Lord": {label: "Time Lord", description: "Completed a task in under 30 minutes", icon: <Clock className="w-6 h-6 text-cyan-400" />},
        "Mood Maestro": {label: "Mood Maestro", description: "Submitted a positive mood", icon: <BrainCircuit className="w-6 h-6 text-purple-400"/>},
        "Level Up Legend": {label: "Level Up Legend", description: "Leveled up", icon: <Trophy className="w-6 h-6 text-yellow-400"/>}
    };

    return (
        <Card className="bg-gradient-to-br from-gray-800 to-black text-white shadow-lg border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Your Badges
                </CardTitle>
                <CardDescription>Achievements unlocked</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.length > 0 ? (
                        badges.map((badgeName) => {
                            const badge = badgeDetails[badgeName];
                            return (
                            <div
                                key={badgeName}
                                className="flex items-center gap-3 bg-black/50 p-3 rounded-lg border border-gray-700"
                            >
                                {badge.icon}
                                <div>
                                    <h4 className="font-semibold">{badge.label}</h4>
                                    <p className="text-sm text-gray-400">{badge.description}</p>
                                </div>
                            </div>
                        )
                        })
                    ) : (
                        <p className="text-gray-400">No badges earned yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// ===============================
// Main App Component
// ===============================

const ScholarQuestApp = () => {
    // ===============================
    // State
    // ===============================
    const [xp, setXp] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedXp = localStorage.getItem('scholarQuestXp');
            return storedXp ? parseInt(storedXp, 10) : 0;
        }
        return 0;
    });
    const [streak, setStreak] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedStreak = localStorage.getItem('scholarQuestStreak');
            return storedStreak ? parseInt(storedStreak, 10) : 1;
        }
        return 1;
    });
    const [log, setLog] = useState([]);
    const [showRewardAnimation, setShowRewardAnimation] = useState(false);
    const [lastDate, setLastDate] = useState(() => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem("lastDate");
          return stored ? new Date(stored) : new Date();
        }
        return new Date();
    });

    const [dailyChallenge, setDailyChallenge] = useState(getRandomDailyChallenge());
    const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(() => {
      if (typeof window !== 'undefined'){
        const stored = localStorage.getItem('dailyChallengeCompleted');
        return stored ? JSON.parse(stored) : false;
      }
      return false;
    });
    const [streakXpBonus, setStreakXpBonus] = useState(0);
    const [badges, setBadges] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedBadges = localStorage.getItem('scholarQuestBadges');
            return storedBadges ? JSON.parse(storedBadges) : [];
        }
        return [];
    });
    const [sideQuestCount, setSideQuestCount] = useState(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sideQuestCount');
        return stored ? parseInt(stored, 10) : 0;
      }
      return 0;
    });
    const [mood, setMood] = useState('');
    const [moodXp, setMoodXp] = useState(0);
    const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
    const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);

    // ===============================
    // Effects
    // ===============================

    // Persist state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('scholarQuestXp', xp.toString());
            localStorage.setItem('scholarQuestStreak', streak.toString());
            localStorage.setItem('lastDate', lastDate.toISOString());
            localStorage.setItem('scholarQuestBadges', JSON.stringify(badges));
            localStorage.setItem('dailyChallengeCompleted', JSON.stringify(dailyChallengeCompleted));
            localStorage.setItem('sideQuestCount', sideQuestCount.toString());
        }
    }, [xp, streak, lastDate, badges, dailyChallengeCompleted, sideQuestCount]);

    // Daily Streak and Bonus
      useEffect(() => {
        const today = new Date();
        const todayString = today.toDateString();
        const lastString = lastDate.toDateString();

        if (todayString !== lastString) {
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                setStreak(prev => prev + 1);
            } else {
                setStreak(1);
            }
            setLastDate(today);
        }

        if (streak >= 7) {
            setStreakXpBonus(50);
        } else {
            setStreakXpBonus(0);
        }
    }, [streak, lastDate]);

    // Badges
    useEffect(() => {
        if (xp >= 100 && !badges.includes("Page Turner")) {
            setBadges(prev => [...prev, "Page Turner"]);
        }
        if (sideQuestCount >= 50 && !badges.includes("Side Quest Hero")) {setBadges(prev => [...prev, "Side Quest Hero"]);
        }
        if (streak >= 7 && !badges.includes("Streak Master")){
            setBadges(prev => [...prev, "Streak Master"]);
        }
    }, [xp, badges, sideQuestCount, streak]);

    // New Daily Challenge every day
      useEffect(() => {
        const today = new Date().toDateString();
        const lastChallengeDate = localStorage.getItem('lastChallengeDate');

        if (lastChallengeDate !== today) {
            setDailyChallenge(getRandomDailyChallenge());
            setDailyChallengeCompleted(false);
            localStorage.setItem('lastChallengeDate', today);
            localStorage.removeItem('dailyChallengeCompleted'); // Ensure completed status resets
        }
    }, []);

    // ===============================
    // Functions
    // ===============================

    const addXp = useCallback((amount: number, label: string) => {
        const newXp = xp + amount;
        setXp(newXp);
        setLog(prev => [...prev, { label, amount, timestamp: new Date() }]);

        const previousLevel = Math.floor(xp / XP_PER_LEVEL);
        const newLevel = Math.floor(newXp / XP_PER_LEVEL);

        if (newLevel > previousLevel) {
            setShowLevelUpAnimation(true);
            setBadges(prev => [...prev, "Level Up Legend"]);
            setTimeout(() => setShowLevelUpAnimation(false), 5000);
        }

        if (Math.floor(newXp / REWARD_INTERVAL) > Math.floor(xp / REWARD_INTERVAL)) {
            triggerRewardAnimation();
        }
    }, [xp]);

    const triggerRewardAnimation = () => {
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 5000);
    };

    const completeChallenge = () => {
        if (!dailyChallengeCompleted) {
            setXp(prev => prev + DAILY_CHALLENGE_XP);
            setDailyChallengeCompleted(true);
            alert(`You've completed the challenge: ${dailyChallenge}! +${DAILY_CHALLENGE_XP} XP`);
        } else {
            alert("You've already completed today's challenge!");
        }
    };

    const handleStreakXp = () => {
        setXp(prev => prev + streakXpBonus);
        if (streakXpBonus > 0) {
            alert(`Bonus! You've earned ${streakXpBonus} XP for your streak!`);
        }
    };

    const handleMoodChange = (newMood: string) => {
        setMood(newMood);
        const selectedMoodOption = MOOD_OPTIONS.find(option => option.value === newMood);
        if (selectedMoodOption) {
            setMoodXp(selectedMoodOption.xp);
        } else {
            setMoodXp(0);
        }
    };

    const submitMood = () => {
        if (moodXp > 0) {
            setXp(prev => prev + moodXp);
            alert(`You earned ${moodXp} XP for your mood!`);
            if (moodXp === 10){
                setBadges(prev => [...prev, "Mood Maestro"]);
            }
        }
        setMood('');
        setMoodXp(0);
    };

    const completeSideQuest = (quest: string) => {
        setXp(prev => prev + SIDE_QUEST_XP);
        setSideQuestCount(prev => prev + 1);
    };

    const startTask = () => {
        setTaskStartTime(new Date());
    };

    const completeTask = () => {
        if (taskStartTime) {
            const taskDuration = new Date().getTime() - taskStartTime.getTime();
            if (taskDuration <= 30 * 60 * 1000) {
                setXp(prev => prev + 10);
                alert("You completed this task quickly! +10 XP");
                setBadges(prev => [...prev, "Time Lord"]);
            }
            setTaskStartTime(null);
        } else {
            alert("Please start a task first!");
        }
    };

    // ===============================
    // Render
    // ===============================

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1
                    className="text-4xl font-bold text-center text-transparent bg-clip-text
                               bg-gradient-to-r from-blue-400 to-purple-400"
                >
                    Scholar Quest
                </h1>

                <XpDisplay xp={xp} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DailyChallengeCard
                        challenge={dailyChallenge}
                        onComplete={completeChallenge}
                        completed={dailyChallengeCompleted}
                    />
                    <StreakBonusCard
                        streak={streak}
                        onClaim={handleStreakXp}
                        bonus={streakXpBonus}
                    />
                    <SideQuestCard onComplete={completeSideQuest} />
                    <MoodTrackerCard
                        onMoodSelect={handleMoodChange}
                        onSubmit={submitMood}
                        selectedMood={mood}
                    />
                    <TimeTrackerCard
                        onStart={startTask}
                        onComplete={completeTask}
                        isTracking={!!taskStartTime}
                    />
                    <BadgeCard badges={badges} />
                </div>

                <div className="space-y-4">
                    <h2
                        className="text-2xl font-semibold text-white text-center
                                   bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent"
                    >
                        Task Categories
                    </h2>
                    {Object.entries(TASK_CATEGORIES).map(([category, tasks]) => (
                        <Card
                            key={category}
                            className="bg-black/50 border-gray-700 shadow-md"
                        >
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-white">
                                    {category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tasks.map((task) => (
                                    <TaskButton
                                        key={task.label}
                                        label={task.label}
                                        value={task.value}
                                        onClick={addXp}
                                        icon={task.icon}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <AnimatePresence>
                    {showRewardAnimation && <RewardAnimation />}
                </AnimatePresence>
                <AnimatePresence>
                    {showLevelUpAnimation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1.2, transition: { duration: 0.8 } }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
                            className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
                        >
                            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-6 rounded-3xl shadow-2xl border-4 border-black text-center">
                                <CardHeader>
                                    <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3">
                                        <Sparkles className="w-10 h-10" />
                                        Level Up!
                                        <Sparkles className="w-10 h-10" />
                                    </CardTitle>
                                    <CardDescription className="text-xl">
                                        Congratulations! You reached level {Math.floor(xp / XP_PER_LEVEL) + 1}!
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ScholarQuestApp;
