using Business.Domain;
using DataLayer.EFCore;
using System.Threading.Tasks;

namespace Tests.Integration.Seeding
{
	public class EventLogs
	{
		public static async Task<User> BelongsToUser(AppDbContext context, string nameOfUser = "Default User.Name")
		{
			User newUser = new User
			{
				Name = nameOfUser,
				LastEvent = new EventLog
				{
				}
			};
			context.Users.Add(newUser);
			await context.SaveChangesAsync();
			await context.Users.Entry(newUser).ReloadAsync();
			return newUser;
		}

		public static async Task<Board> BelongsToBoard(AppDbContext context, string nameOfBoard = "Default Board.Name")
		{
			Board newBoard = new Board
			{
				Name = nameOfBoard,
				LastEvent = new EventLog
				{
				},
				FirstEvent = new EventLog
				{
				}
			};
			context.Boards.Add(newBoard);
			await context.SaveChangesAsync();
			await context.Boards.Entry(newBoard).ReloadAsync();
			return newBoard;
		}
	}
}
