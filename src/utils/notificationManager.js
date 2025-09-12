// Gestionnaire de notifications offline
class NotificationManager {
  constructor() {
    this.storageKey = 'clientNotifications';
  }

  // Ajouter une notification pour un utilisateur spécifique
  addNotification(notification, userId) {
    if (!userId) {
      console.error('User ID is required to add notification');
      return null;
    }

    const notifications = this.getAllNotifications();
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      userId: userId, // Ajouter l'ID utilisateur
      ...notification
    };
    
    notifications.unshift(newNotification);
    this.saveNotifications(notifications);
    
    console.log('Notification added for user:', userId, newNotification);
    return newNotification;
  }

  // Récupérer toutes les notifications
  getAllNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Récupérer les notifications d'un utilisateur spécifique
  getUserNotifications(userId) {
    if (!userId) {
      console.error('User ID is required to get notifications');
      return [];
    }

    const allNotifications = this.getAllNotifications();
    return allNotifications.filter(notification => notification.userId === userId);
  }

  // Marquer une notification comme lue
  markAsRead(notificationId, userId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId && n.userId === userId ? { ...n, read: true } : n
    );
    this.saveNotifications(updated);
  }

  // Supprimer une notification
  deleteNotification(notificationId, userId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.filter(n => !(n.id === notificationId && n.userId === userId));
    this.saveNotifications(updated);
  }

  // Compter les notifications non lues pour un utilisateur
  getUnreadCount(userId) {
    if (!userId) return 0;
    const userNotifications = this.getUserNotifications(userId);
    return userNotifications.filter(n => !n.read).length;
  }

  // Sauvegarder les notifications
  saveNotifications(notifications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Nettoyer les anciennes notifications (plus de 30 jours)
  cleanup() {
    const notifications = this.getAllNotifications();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = notifications.filter(n => 
      new Date(n.timestamp) > thirtyDaysAgo
    );
    
    if (recent.length !== notifications.length) {
      this.saveNotifications(recent);
      console.log(`Cleaned up ${notifications.length - recent.length} old notifications`);
    }
  }
}

// Instance singleton
export const notificationManager = new NotificationManager();

// Nettoyer automatiquement au démarrage
notificationManager.cleanup();
