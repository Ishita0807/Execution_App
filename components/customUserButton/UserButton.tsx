'use client';

import {useRouter} from 'next/navigation';
import {useUser} from '@/providers/usercontext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';


export const UserButton = () => {
    const { user, setUser } = useUser();
    const router = useRouter();

    if (!user) return (
        <div className='w-full flex gap-2 items-center justify-center'>
            <Button onClick={()=>{
                window.location.href = '/login'
            }}>
                Login
            </Button>

            <Button onClick={()=>{
                window.location.href = '/register'
            }}>
                Sign Up
            </Button>
        </div>
    );

    const handleLogout = async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/login');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-10 w-10 flex items-center justify-between">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.imageUrl} alt={user.firstName} />
                        <AvatarFallback>{user.firstName[0] + user.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <span>
                        {user.firstName + " " + user.lastName}
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.firstName + " " + user.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};