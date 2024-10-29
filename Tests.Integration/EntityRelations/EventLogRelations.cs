using DataLayer.EFCore;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Tests.Integration.Helper;
using Tests.Integration.Seeding;

namespace Tests.Integration.EntityRelations
{
	public class EventLogRelations
	{
		private readonly AppDbContext _dbContext;

		public EventLogRelations()
        {
			_dbContext = DbContextFactory.Initiate();
        }

		[OneTimeTearDown]
		public async Task TestEnd()
		{
			await _dbContext.Database.EnsureDeletedAsync();
			await _dbContext.DisposeAsync();
		}

        [Test]
		public async Task DeleteBoard_ShouldDeleteEventLogsAsWell()
		{
			var newBoard = await EventLogs.BelongsToBoard(_dbContext);
			Assert.True(await _dbContext.Boards.Where(x => x.Id == newBoard.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.FirstEvent.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.LastEvent.Id).CountAsync() == 1);

			await _dbContext.Boards.Where(x => x.Id == newBoard.Id).ExecuteDeleteAsync();

			Assert.True(await _dbContext.Boards.Where(x => x.Id == newBoard.Id).CountAsync() == 0);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.FirstEvent.Id).CountAsync() == 0);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.LastEvent.Id).CountAsync() == 0);
		}

		[Test]
		public async Task DeleteUser_ShouldDeleteEventLogsAsWell()
		{
			var newUser = await EventLogs.BelongsToUser(_dbContext);
			Assert.True(await _dbContext.Users.Where(x => x.Id == newUser.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newUser.LastEvent.Id).CountAsync() == 1);

			await _dbContext.Users.Where(x => x.Id == newUser.Id).ExecuteDeleteAsync();

			Assert.True(await _dbContext.Users.Where(x => x.Id == newUser.Id).CountAsync() == 0);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newUser.LastEvent.Id).CountAsync() == 0);
		}

		[Test]
		public async Task DeleteEventLogs_ShouldKeepRelatedUserAndBoard()
		{
			var newBoard = await EventLogs.BelongsToBoard(_dbContext);
			var newUser = await EventLogs.BelongsToUser(_dbContext);
			Assert.True(await _dbContext.Users.Where(x => x.Id == newUser.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newUser.LastEvent.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Boards.Where(x => x.Id == newBoard.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.FirstEvent.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.Where(x => x.Id == newBoard.LastEvent.Id).CountAsync() == 1);

			await _dbContext.Events.Where(x => true).ExecuteDeleteAsync();

			Assert.True(await _dbContext.Users.Where(x => x.Id == newUser.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Boards.Where(x => x.Id == newBoard.Id).CountAsync() == 1);
			Assert.True(await _dbContext.Events.CountAsync() == 0);
		}
	}
}
