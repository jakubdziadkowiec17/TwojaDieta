import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import type { Order, PaymentStatus } from '../types';

interface OrderDetailsDialogProps {
  order: Order;
  trigger: ReactNode;
}

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return iso;
  }
}

function paymentStatusClasses(status: PaymentStatus): string {
  if (status === 'Opłacone') return 'bg-primary/10 text-primary';
  if (status === 'Oczekuje na płatność') return 'bg-accent/15 text-accent';
  if (status === 'Zwrócone') return 'bg-secondary text-muted-foreground';
  return 'bg-destructive/10 text-destructive';
}

export function OrderDetailsDialog({ order, trigger }: OrderDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Szczegóły zamówienia #{order.id}</DialogTitle>
          <DialogDescription>
            Złożono {formatDateTime(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-secondary px-3 py-1 text-foreground">
            Status realizacji: {order.status}
          </span>
          <span className={`rounded-full px-3 py-1 ${paymentStatusClasses(order.paymentStatus)}`}>
            Płatność: {order.paymentStatus}
          </span>
        </div>

        <div className="grid gap-4 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Klient</div>
            <div className="font-medium">{order.customer.firstName} {order.customer.lastName}</div>
            <div className="text-muted-foreground">{order.customer.email}</div>
            <div className="text-muted-foreground">{order.customer.phone}</div>
          </div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Dostawa</div>
            <div>{order.delivery.addressLine1}</div>
            <div>{order.delivery.addressPostalCode} {order.delivery.addressCity}</div>
            <div className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground">Uwagi:</span>{' '}
              {order.delivery.notes?.trim() || 'Brak'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Zamówione diety</h4>
          {order.items.map((item, index) => (
            <div key={`${item.dietId}-${index}`} className="flex flex-wrap justify-between gap-3 rounded-lg bg-secondary/50 p-3 text-sm">
              <div>
                <div className="font-medium">{item.dietName}</div>
                <div className="text-muted-foreground">
                  {item.calories} kcal • {item.days} dni • start: {item.startDate}
                </div>
              </div>
              <div className="font-medium">{item.pricePerDay * item.days} zł</div>
            </div>
          ))}
        </div>

        <div className="ml-auto w-full space-y-2 border-t border-border pt-4 text-sm sm:w-72">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produkty</span>
            <span>{order.subtotal} zł</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Rabat{order.couponCode ? ` (${order.couponCode})` : ''}</span>
              <span>-{order.discountAmount} zł</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dostawa</span>
            <span>{order.deliveryCost === 0 ? 'Gratis' : `${order.deliveryCost} zł`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metoda płatności</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>Razem</span>
            <span className="text-primary">{order.total} zł</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
