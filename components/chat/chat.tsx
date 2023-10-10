import { api } from "@/services/api";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import {AxiosError} from "axios";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/hooks/auth-hook";
import moment from "moment";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAppState } from "@/hooks/app-store/store-hook";

interface IMessage {
  "id": string,
  "senderName": string,
  "content": string,
  "roomId": string,
  "createdAt": string,
}

const Chat = () => {
  const [sendingMsg, setSendingMsg] = useState(false);
  const [message, setMessage] = useState("");

  const {auth} = useAuth();
  const appState = useAppState();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (message.trim() === "" || appState.selectedRoom === undefined)
      return;

    setSendingMsg(true);
    api.post<IMessage>(`/messages/${appState.selectedRoom}`, {content: message})
      .then(response => {
        console.log(response.data);
        setMessage("");
      })
      .catch(error => console.log(error))
      .finally(() => setSendingMsg(false));
  }

  return ( 
    <div className="flex flex-col justify-center items-center bg-slate-200 w-full">
      {
        appState.loading.messages ?
        <PulseLoader color="#94a3b8" className=""/> :
        <>
          <ScrollArea className="w-full h-full px-5 pt-2">
            <div className="flex flex-col gap-4 scroll-smooth">
            {appState.selectedRoom?.messages.map(msg => (
              <div key={msg.id} 
                className={cn("flex flex-row flex-1 max-w", msg.senderName === auth?.username && "justify-end")}
              >
                <div 
                  className={cn("flex flex-col px-2 py-1 rounded-lg shadow-lg max-w-[40%]",
                    msg.senderName === auth?.username ? "bg-emerald-500" : "bg-slate-400")}
                >
                  <span className="text-xs font-semibold text-slate-200">{msg.senderName}</span>
                  <span className="text-slate-50">{msg.content}</span>
                  <span className="text-xs text-slate-200 text-end">{moment(Date.parse(msg.createdAt)).format("HH:mm")}</span>
                </div>
              </div>
            ))}
            </div>
          </ScrollArea>
          <div className="w-full p-2">
            <form className="flex gap-2" onSubmit={(e) => onSubmit(e)}>
              <Input type="text" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
              <Button type="submit" disabled={sendingMsg || message===""} className="bg-slate-800 w-20 transition-all">
                {
                  sendingMsg ?
                    <PulseLoader color="#fff" size={6} /> :
                    "Send"
                }
              </Button>
            </form>
          </div>
        </>
      }
    </div>
   );
}
 
export default Chat;