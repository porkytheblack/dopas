import { Header } from "@/components/Header"
import { ChatContainer } from "@/components/ChatContainer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1">
        <ChatContainer />
      </div>
    </div>
  )
}
