SmartCart – AI-Powered Smart Cart System


Overview

SmartCart is an AI-based e-commerce cart system that provides real-time personalized recommendations using a hybrid ML approach.

Features
	•	Hybrid ML (Association + Semantic)
	•	Intent Detection (budget, category, style)
	•	Real-time cart suggestions
	•	Smart scoring & ranking
	•	Chatbot integration

    Tech Stack
	•	Frontend: React Native (Expo)
	•	Backend: Flask (Python)
	•	Database: MongoDB
	•	ML: Sentence Transformers + Apriori

   TechStack (Expo)
   # Install dependencies
npm install

# Start app
npx expo start
Then open in:
	•	Android Emulator
	•	iOS Simulator
	•	Expo Go

Backend Setup
pip install -r requirements.txt
python ml_service.py

ML Logic

Final Score:
3× Association + Category (0.3) + Style (0.2) + Brand (0.1) + 0.3× Semantic

 APIs
	•	POST /recommend
	•	POST /chat

   Impact
	•	Improves personalization
	•	Reduces cart abandonment
	•	Enhances user experience
